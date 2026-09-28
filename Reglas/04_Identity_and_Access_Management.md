# 04 Identity and Access Management (IAM)

## Autenticación y Autorización
- Toda ruta protegida debe verificar tanto la autenticación (usuario logueado) como la autorización (roles y permisos correspondientes).
- El manejo de sesiones debe ser seguro, empleando estrategias modernas (Cookies HttpOnly para tokens, verificación CSRF donde aplique).
- En el contexto Multi-Tenant, el acceso de un usuario a un `tenantId` debe resolverse en el middleware o en una capa de contexto superior antes de cargar vistas sensibles.
