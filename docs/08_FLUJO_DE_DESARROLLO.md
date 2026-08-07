# 08 - FLUJO DE DESARROLLO Y ARQUITECTURA DEL CÓDIGO

## Estructura de Carpetas (Árbol Final del Proyecto)
```
/
├── .github/              # CI/CD workflows
├── docs/                 # Documentación técnica
│   ├── REFERENCIAS/      # Imágenes y capturas de diseño
├── public_pwa/           # Código fuente PWA (React/Vite)
│   ├── public/           # Archivos estáticos, manifest.json
│   ├── src/
│   │   ├── assets/       # Imágenes, fuentes
│   │   ├── components/   # Componentes UI
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── pages/        # Vistas de la aplicación
│   │   ├── services/     # Llamadas a Supabase (backend)
│   │   ├── utils/        # Funciones auxiliares
│   │   └── App.tsx       # Root component
├── private_app/          # Código fuente App Privada (Android/Compose)
│   ├── app/src/main/
│   │   ├── java/...      # Código fuente Android
│   │   └── res/          # Recursos
└── supabase/             # Migraciones y esquema SQL
```

## Manejo de Errores
- **PWA**: Error boundaries en React. Mostrar mensajes amigables al usuario (Toast/Alert) si falla Supabase.
- **App Privada**: Propagación de excepciones hacia la UI mediante Snackbars.

## Proceso de Despliegue
- **PWA**: Despliegue automatizado hacia un hosting estático (Vercel/Netlify/Supabase).
- **App Privada**: Generación y distribución manual/privada del APK a los empleados.
