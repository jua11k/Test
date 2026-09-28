# 05 SaaS Storefront

## Rutas Públicas e Integraciones de Pago
- El Storefront o "Landing Page" debe ser estático (SSG) o cacheados al máximo (ISR) para asegurar tiempos de respuesta ultra rápidos de cara al SEO.
- Toda integración de pasarelas de pago (Stripe, MercadoPago, etc.) debe realizarse exclusivamente del lado del servidor utilizando webhooks seguros con verificación de firmas.
