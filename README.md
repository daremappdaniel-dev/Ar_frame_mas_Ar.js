# AR.js Location-Based Demo

Prueba de concepto de **Realidad Aumentada basada en geolocalización** usando tecnologías web. Permite visualizar un modelo 3D en coordenadas GPS específicas desde el navegador móvil.

## Tecnologías

- **A-Frame** v1.6.0 - Framework de realidad virtual web
- **AR.js** v3.4+ - Librería de realidad aumentada (versión mantenida por `@ar-js-org`)
- **JavaScript** - Lógica de carga y estabilización

## Funcionalidades

- **Posicionamiento GPS**: Uso de componentes `gps-camera` y `gps-entity-place`
- **Estabilización de imagen**:
  - `gpsMinDistance: 50` para reducir recálculos innecesarios
  - Sistema de congelado de posición tras 5 segundos para eliminar el jitter del GPS
- **Visualización 3D real**: Sin efecto billboard, permitiendo ver el objeto desde todos los ángulos

## Demos

Los videos de demostración están disponibles en:

- [Demo 1 - Prueba inicial](assets/daremapp/videos/Screenrecorder-2026-01-29-12-38-43-914.mp4)
- [Demo 2 - Versión estabilizada](assets/daremapp/videos/Screenrecorder-2026-01-29-12-50-33-732.mp4)

## Estructura del proyecto

```
├── index.html              # Escena A-Frame con configuración AR
├── script.js               # Lógica de carga dinámica y estabilización
├── style.css               # Estilos
└── assets/daremapp/
    ├── daremapp_logo.glb   # Modelo 3D del logo
    └── videos/             # Grabaciones de pruebas
```

## Problemas resueltos

| Problema                         | Solución                                        |
| -------------------------------- | ----------------------------------------------- |
| Jitter GPS (parpadeo del objeto) | Congelado de posición tras 5s de estabilización |
| Efecto billboard                 | Eliminación del atributo `look-at`              |
| Librerías obsoletas              | Migración a `@ar-js-org/AR.js`                  |

## Requisitos

- Dispositivo móvil con GPS y cámara
- Conexión HTTPS (requisito de la API de geolocalización)
- Permisos de cámara y ubicación

## Autor

Daniel - [DareMapp](https://github.com/daremappdaniel-dev)
