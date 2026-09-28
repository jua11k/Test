# 00 SaaS Factory Master Standard

## Arquitectura de Monorepositorio
- Este proyecto utiliza **Turborepo** como orquestador del monorepositorio.
- La estructura base se divide en `apps/` (aplicaciones web/móviles) y `packages/` (paquetes compartidos).
- **Gestor de Paquetes Único:** Está estrictamente prohibido usar `npm`, `yarn` o `bun`. El único gestor permitido es **`pnpm`**.

## Soporte Multi-Tenant
- Todas las aplicaciones SaaS deben estar diseñadas bajo un esquema multi-tenant desde su concepción, asegurando el aislamiento de datos por inquilino.
