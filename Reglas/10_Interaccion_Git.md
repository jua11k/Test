# 10 Interacción Git y Flujo de Trabajo

## Nomenclatura de Ramas
- Aísla siempre tu trabajo en ramas nuevas. Ejemplos válidos: `feat/nueva-funcionalidad`, `fix/bug-critico`, `chore/mantenimiento`.

## Flujo de Sincronización
- Antes de iniciar una nueva tarea, debes actualizar tu entorno sincronizándote siempre con la rama `main`.

## Ejecución y Gestor
- Toda instalación debe hacerse con `pnpm install` en la raíz.
- Para ejecutar tareas específicas por aplicación, utiliza los filtros de Turborepo: `pnpm --filter <app> <command>`.
- **Prohibición Total:** Jamás uses `npm` o `yarn`.
