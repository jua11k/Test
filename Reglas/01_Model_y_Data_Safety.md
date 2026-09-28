# 01 Model y Data Safety

## Separación y Aislamiento Multi-Tenant
- Todos los modelos de base de datos deben incluir obligatoriamente el campo `tenantId`.
- Queda estrictamente prohibida cualquier consulta a la base de datos que no filtre por `tenantId`, garantizando que un cliente jamás pueda acceder a datos cruzados.
- Las eliminaciones deben ser `soft deletes` (ej. `deletedAt`) por defecto en entidades críticas del negocio (ej. usuarios, facturas).
