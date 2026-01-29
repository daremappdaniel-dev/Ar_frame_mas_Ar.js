# Ar.js Location-Based AR Demo

Este proyecto es una prueba de concepto de **Realidad Aumentada basada en Geolocalización** utilizando tecnologías web. Permite visualizar un modelo 3D (Logo de DareMapp) en unas coordenadas GPS específicas, estabilizado y con percepción de volumen 3D.

## 🚀 Tecnologías

- **A-Frame** (v1.6.0) - Framework para realidad virtual en web.
- **AR.js** (v3.4+) - Versión mantenida por `@ar-js-org` (no la obsoleta de `jeromeetienne`).
- **HTML5 & JavaScript** - Carga dinámica de modelos y lógica de estabilización.

## ✨ Características Implementadas

- **Posicionamiento GPS**: Uso de componentes actualizados (`gps-camera`, `gps-entity-place`).
- **Estabilización de Imagen**:
  - `gpsMinDistance: 50`: La cámara solo recalcula si el usuario se mueve más de 50 metros.
  - **Lógica de Congelado (Freeze Logic)**: Script personalizado que captura la posición del objeto a los 5 segundos y la bloquea para evitar parpadeos y saltos del GPS ("jitter").
- **Visualización 3D Real**:
  - Eliminación del atributo `look-at` ("efecto billboard") para permitir al usuario caminar alrededor del objeto y apreciar su volumen y perfil.
- **Carga Dinámica**: Inyección de modelos mediante JavaScript (`script.js`) para mayor control sobre el ciclo de vida de los objetos AR.

## 🎥 Demos

- [Demo de funcionamiento 1](assets/daremapp/videos/Screenrecorder-2026-01-29-12-38-43-914.mp4)
- [Demo de funcionamiento 2](assets/daremapp/videos/Screenrecorder-2026-01-29-12-50-33-732.mp4)

## 🛠️ Historial de Desarrollo (Changelog)

Registro de los cambios y mejoras realizadas durante la sesión de refactorización:

1.  **Depuración inicial**: Activación de `debugUIEnabled: true` para verificar la precisión de coordenadas en pantalla.
2.  **Ajuste de visibilidad**: Aumento de escala del modelo para asegurar su visibilidad a distancia.
3.  **Actualización de Core**: Migración completa a librerías modernas (`@ar-js-org/AR.js`, `aframe-ar-nft.js`), eliminando dependencias obsoletas que causaban conflictos.
4.  **Tests de compatibilidad**: Pruebas con distintas versiones de librerías para asegurar estabilidad en móviles.
5.  **Corrección de Asincronía**: Solución a los errores de carga donde `AFRAME` no estaba definido por scripts `module` mal ordenados.
6.  **Refactorización a Estándar**: Adopción del patrón oficial de ejemplos de GitHub de AR.js.
7.  **Calibración de Escala**: Pruebas de reducción (0.5) y reajuste (1.0) para encontrar el tamaño óptimo.
8.  **Optimización de Assets**: Reemplazo del modelo 3D por una versión optimizada en Blender (reducción de grosor excesivo).
9.  **Limpieza de Código**: Simplificación del HTML para delegar la lógica al script JS.
10. **Lógica de Estabilización**: Implementación de `gpsMinDistance: 50` para reducir el ruido del GPS.
11. **Script de Control**: Creación de funciones `staticLoadPlaces()` y `freezePositionAfterDelay()` para manejo dinámico.
12. **Anti-Flicker**: Reimplementación del sistema de "congelado" de posición a los 5 segundos, eliminando el parpadeo constante.
13. **Percepción 3D**: Eliminación del atributo `look-at` para evitar que el logo gire con el usuario, permitiendo ver su tridimensionalidad real.
