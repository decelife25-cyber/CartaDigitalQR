# 19 - ESPECIFICACIÓN DEL MANIFEST PWA

## Objetivo
Definir la configuración obligatoria para la instalación de la PWA (Carta Pública).

## manifest.json
```json
{
  "name": "CartaDigitalQR",
  "short_name": "Carta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#D4AF37",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
*Los colores y el nombre final serán inyectados/modificados dinámicamente según la tabla de Configuración, pero este es el esqueleto base.*
