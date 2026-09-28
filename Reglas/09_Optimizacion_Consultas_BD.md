# 09 Optimización de Consultas BD

## Esquemas Drizzle y Performance
- Utilizar `Drizzle ORM` garantizando tipos de inferencia exactos entre el esquema y el modelo de TypeScript.
- Evitar el problema "N+1" en las consultas utilizando los joins relacionales nativos (ej. `db.query.tabla.findMany({ with: ... })`) en lugar de mapas interactivos.
- Seleccionar únicamente las columnas necesarias (`columns: { id: true, name: true }`) en llamadas masivas para reducir la carga de red y memoria.
