# 06 Integraciones y Automatización Externa

## Comunicación con Terceros
- Toda llamada a APIs de terceros debe envolverse en funciones asíncronas seguras con mecanismos de reintento (`retries`) y `timeouts` para evitar bloqueos del hilo principal.
- Las credenciales y API keys de integraciones deben almacenarse en variables de entorno estrictamente controladas, nunca expuestas del lado del cliente.
