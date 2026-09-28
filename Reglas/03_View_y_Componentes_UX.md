# 03 View y Componentes UX

## Estética y Diseño Estricto
- El diseño y la estética visual de la interfaz están definidos estrictamente por la base de código inicial. Todos los nuevos desarrollos deben mantener una cohesión y fidelidad absoluta con los estilos, paleta de colores y patrones heredados del proyecto.
- Cualquier modificación a los estilos globales debe estar justificada y aplicarse centralizadamente.

## Sistema de Componentes (@repo/ui)
- Todo componente visual, layout, botón o formulario debe ser extraído, mantenido y consumido de forma obligatoria desde el paquete compartido `@repo/ui`.
- Queda terminantemente prohibida la creación de componentes locales aislados (ad-hoc) dentro de las aplicaciones (ej. en `apps/web/src/components`). Cualquier pieza de interfaz debe incorporarse al sistema de diseño en `packages/ui` garantizando la reutilización.
