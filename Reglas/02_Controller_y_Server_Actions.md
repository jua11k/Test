# 02 Controllers y APIs

## Interacciones del Servidor
- **Adaptación al Stack:** Como no disponemos de Next.js, todas las mutaciones y lecturas deben realizarse a través de controladores seguros montados en Express (o tRPC).
- Toda petición entrante DEBE ser rigurosamente validada en el middleware de entrada utilizando esquemas tipados como `Zod`.
- Los controladores deben manejar capturas globales (`try/catch`) y retornar respuestas estandarizadas (ej. `{ success: boolean, data: any, error?: string }`).
