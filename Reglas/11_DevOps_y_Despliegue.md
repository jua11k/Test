# 🚀 Regla 11: DevOps, CI/CD y Despliegue de Contenedores

## 🎯 Propósito
Garantizar que los despliegues de aplicaciones Next.js dentro del monorepositorio (Turborepo + pnpm) sean deterministas, estables y no fallen por políticas de seguridad estrictas, problemas de caché o validaciones en tiempo de compilación.

## 📜 Directrices para Docker y CI/CD

### 1. Seguridad y Scripts de pnpm (`pnpm install`)
Desde pnpm v9+, la instalación bloquea los scripts post-instalación de paquetes que descargan binarios (como `esbuild` o `sharp`) si no están explícitamente autorizados.
- **Regla:** En cualquier `Dockerfile` o pipeline de CI/CD, el comando de instalación de dependencias **DEBE** ejecutarse con la bandera `--ignore-scripts`.
- **Comando Estándar:** `RUN pnpm install --frozen-lockfile --ignore-scripts`

### 2. Prevención de Bloqueos por Telemetría (Hangs)
Turborepo y Next.js incluyen prompts interactivos de recolección de datos (ej. `¿Deseas compartir datos anónimos? (Y/n)`). En un entorno Docker/CI sin un TTY interactivo, esto causa que el despliegue se quede "colgado" infinitamente.
- **Regla:** Todo `Dockerfile` debe inyectar obligatoriamente las siguientes variables de entorno globales antes de ejecutar cualquier comando de construcción:
  ```dockerfile
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV TURBO_TELEMETRY_DISABLED=1
  ENV DO_NOT_TRACK=1
  ```

### 3. Validaciones de Entorno en Tiempo de Compilación (Build-Time)
Durante el comando `next build`, Next.js importa, analiza estáticamente y evalúa todos los archivos (incluyendo rutas de API y conexión a base de datos como `src/db/index.ts`). Si el código lanza un error cuando falta una variable secreta (ej. `process.env.DATABASE_URL`), el build fallará porque Docker no tiene acceso a los secretos de producción durante la fase de compilación.
- **Regla:** En el `Dockerfile`, justo antes del comando de `build`, inyectar variables de entorno falsas (dummy) para pasar las validaciones estrictas:
  ```dockerfile
  ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
  RUN pnpm turbo run build --filter=nombre_app...
  ```

### 4. Propagación de Variables en Turborepo (`turbo.json`)
Turborepo elimina del sistema todas las variables de entorno para garantizar un caché determinista. Si inyectas una variable en el `Dockerfile` (como el `DATABASE_URL` del punto anterior), Turborepo la borrará antes de arrancar Next.js.
- **Regla:** Cualquier variable de entorno requerida estrictamente durante el proceso de compilación **DEBE** estar declarada en el arreglo `env` de la tarea `build` en `turbo.json`:
  ```json
  "build": {
    "dependsOn": ["^build"],
    "env": ["DATABASE_URL"],
    "outputs": [".next/**", "!.next/cache/**", "dist/**"]
  }
  ```

### 5. Compilación "Standalone" en Monorepos (Error 502 por dependencias)
Cuando Next.js se compila en modo `standalone` dentro de un monorepo (como pnpm workspaces), intenta copiar las dependencias necesarias a `.next/standalone`. Por defecto, solo busca dentro de su propia carpeta de la app (`apps/mi_app`). Como pnpm instala casi todo en la raíz del monorepo (`node_modules` globales), el contenedor arrancará sin dependencias y crasheará instantáneamente, devolviendo un error **502 Bad Gateway**.
- **Regla A (Traceo de raíz):** En **todas** las aplicaciones de Next.js, el archivo `next.config.mjs` **DEBE** incluir el parámetro `outputFileTracingRoot` apuntando a la raíz del monorepo:
  ```javascript
  const nextConfig = {
      output: "standalone",
      outputFileTracingRoot: path.join(__dirname, "../../"),
  }
  ```
- **Regla B (El Bug de Symlinks de pnpm):** Aún con la Regla A, Next.js tiene un bug conocido al rastrear dependencias internas (como `@swc/helpers`) en repositorios con pnpm. Next.js "hardcodea" la ruta física que incluye la carpeta de symlinks oculta `.pnpm`. Al crear la carpeta standalone, Next.js aplasta los symlinks y destruye `.pnpm`, lo que genera un error `MODULE_NOT_FOUND` buscando dentro de `.pnpm` en el servidor de producción.
Para solucionarlo de raíz, el `Dockerfile` **DEBE** copiar explícitamente la carpeta `.pnpm` en la etapa final (`runner`):
  ```dockerfile
  COPY --from=installer --chown=nextjs:nodejs /app/apps/order_saas/.next/standalone ./
  # SOLUCIÓN CRÍTICA PARA EL BUG DE PNPM Y NEXT.JS STANDALONE
  COPY --from=installer --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
  ```

### 6. Despliegue Selectivo (Optimización de Recursos)
Para evitar que un cambio en una sola aplicación desencadene la compilación simultánea de todas las aplicaciones en Easypanel (lo cual agotaría la CPU y RAM del servidor VPS), usamos GitHub Actions para orquestar los despliegues.
- **Regla:** El despliegue automático nativo de Easypanel **DEBE estar desactivado**. Todo despliegue se gestiona a través del archivo `.github/workflows/deploy.yml`.
- **Acción Requerida al Crear una Nueva App:** Cada vez que se cree una nueva aplicación en el monorepositorio, es obligatorio:
  1. Ir a la configuración del repositorio en GitHub (`Settings > Secrets and variables > Actions`).
  2. Crear un nuevo secreto (`New repository secret`) con la URL del Webhook de Easypanel (ej. `WEBHOOK_MI_NUEVA_APP`).
  3. Actualizar el archivo `.github/workflows/deploy.yml` agregando el filtro de rutas para la nueva carpeta y el `step` condicional que ejecuta el `curl` a dicho webhook secreto.

### 7. Restricciones del Edge Runtime (Middleware) y Variables de Entorno
El Edge Runtime de Next.js (utilizado por el `middleware.ts`) es altamente restrictivo y no tiene acceso garantizado a las variables de entorno privadas del contenedor de Docker en tiempo de ejecución (especialmente en entornos standalone self-hosted como Easypanel).
- **Regla Crítica:** Está **estrictamente prohibido** realizar validaciones criptográficas (ej. usar `jwtVerify` de `jose`) o depender de variables secretas (como `process.env.SESSION_SECRET`) dentro del archivo `middleware.ts`.
- **Patrón Correcto:** El middleware solo debe verificar la *presencia física* de las cookies (`request.cookies.has(...)`). Toda la lógica de desencriptación, validación de firmas JWT y validación de expiración debe ejecutarse exclusivamente en el entorno Node.js a través de *Server Actions* o *Server Components*, donde `process.env` es inyectado de manera confiable por Docker.

### 8. Prevención del "Inlining" de Variables de Entorno en Construcción
Cuando Next.js realiza el comando `next build`, compila e intenta pre-renderizar todo el código que puede. Si en el alcance global (fuera de cualquier función) de un archivo lees variables como `process.env.SESSION_SECRET`, y esta variable **no existe en ese milisegundo durante el Docker build**, Next.js reemplazará la variable con un texto vacío `""` permanentemente en el código fuente.
- **Regla:** **NUNCA** evalúes variables de entorno sensibles en el "scope" global de un archivo. Debes evaluarlas de forma **diferida (lazy evaluation)**, es decir, *dentro* de la función específica que las utiliza, para obligar a Next.js a leer el entorno real (inyectado por Easypanel) en tiempo de ejecución.
  - ❌ Incorrecto: `const secret = process.env.SECRET; export async function verify() { ... }`
  - ✅ Correcto: `export async function verify() { const secret = process.env.SECRET; ... }`

### 9. Desactivación de Caché Estático en Rutas Protegidas
Si una ruta (como `/admin/page.tsx`) devuelve un `redirect("/admin/login")` (por ejemplo, porque la validación de sesión falló temporalmente durante la compilación por falta de variables), Next.js "fotografiará" agresivamente esta redirección en el caché del CDN. Cualquier visita futura será rechazada sin ejecutar tu código, generando un "rebote silencioso".
- **Regla:** Toda ruta (Server Component) que represente un dashboard seguro o que valide autenticación **DEBE** incluir explícitamente la declaración de renderizado dinámico en la parte superior del archivo.
- **Declaración Obligatoria:** `export const dynamic = "force-dynamic";`

## 🛠️ Archivos a replicar para nuevas aplicaciones
Al preparar una nueva aplicación (ej. `BarberSaas`, `park-mate`) para producción, **NO COMIENCES DESDE CERO**. Debes utilizar el siguiente template estándar para el `Dockerfile`.

### Regla Crítica de Nomenclatura (Scope)
Al reemplazar las variables en el template, debes tener extremo cuidado con los nombres:
1. `<NOMBRE_APP_CARPETA>`: Es el nombre de la carpeta física donde reside la aplicación (ej. `BarberSaas`, `order_saas`).
2. `<PACKAGE_NAME_JSON>`: **Debe ser idéntico al campo `"name"` dentro de tu archivo `package.json`**. Turborepo fallará inmediatamente si usas el nombre de la carpeta en lugar del nombre del paquete (scope).

### Template Estándar de Dockerfile
```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1
RUN corepack enable pnpm

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
# REEMPLAZAR <PACKAGE_NAME_JSON> por el "name" exacto del package.json
RUN turbo prune <PACKAGE_NAME_JSON> --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the project
COPY --from=builder /app/out/full/ .
# Proveer variables dummy para pasar la validación estricta de src/db/index.ts en tiempo de compilación
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy"
# REEMPLAZAR <PACKAGE_NAME_JSON> por el "name" exacto del package.json
RUN pnpm turbo run build --filter=<PACKAGE_NAME_JSON>...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# REEMPLAZAR <NOMBRE_APP_CARPETA> por el nombre de la carpeta física
COPY --from=installer /app/apps/<NOMBRE_APP_CARPETA>/next.config.js .
COPY --from=installer /app/apps/<NOMBRE_APP_CARPETA>/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/<NOMBRE_APP_CARPETA>/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=installer --chown=nextjs:nodejs /app/apps/<NOMBRE_APP_CARPETA>/.next/static ./apps/<NOMBRE_APP_CARPETA>/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/<NOMBRE_APP_CARPETA>/public ./apps/<NOMBRE_APP_CARPETA>/public

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# REEMPLAZAR <NOMBRE_APP_CARPETA> por el nombre de la carpeta física
CMD ["node", "apps/<NOMBRE_APP_CARPETA>/server.js"]
```

> [!IMPORTANT]
> **No olvides el `next.config.js`:** Además de este Dockerfile, la aplicación **DEBE** incluir el parámetro `outputFileTracingRoot` (apuntando a `path.join(__dirname, '../../')`) y estar configurada con `output: 'standalone'` en su respectivo archivo de configuración de Next.js, como se indicó en las directrices superiores.
