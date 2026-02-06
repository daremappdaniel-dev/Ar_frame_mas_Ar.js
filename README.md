# A.frame, Ar.js-next y locar MVP

Prototipo de navegación con Realidad Aumentada usando A.frame y Ar.js-next y locar.

1.URL oficial:
https://aframe.io/
https://ar-js-org.github.io/AR.js-Docs/

2.Licencia:
MIT License Mozilla, ahora Supermedium.
AR.js: MIT License Código abierto.

3.Comunidad:
a frame, comunidad muy muy activa
ar.js útima release diciembre 2025
ar.js-next nueva versión modular
locar modulo de ar.js-next se encarga de la geolocalización.

4.Actualizaciones:
a.frame muchas
ar.js nueva versión ar.js-next menos pesada fragmentada en modulo
locar geolocalizacion
ar.js-next natural feature tracking como un qr pero con elemento naturales o edificios

5.Dependencias Angular:
No tiene

6.¿Qué aporta?
3d real,geolocalización,natural feature tracking, modularidad.

7.Problemas:
Jitter GPS 
Efecto billboard
Consumo de muchos recursos

7.Ejemplos reales:
Experiencias cortas educativas.

## Demos (iniciales)
Los videos de demostración están disponibles en:

- [Demo 1 - Prueba inicial](assets/daremapp/videos/Screenrecorder-2026-01-29-12-38-43-914.mp4)
- [Demo 2 - Versión estabilizada](assets/daremapp/videos/Screenrecorder-2026-01-29-12-50-33-732.mp4)

## FUNCIONA 🚀

## MVP Funcional:

Demostrado se puede utilizar locar(modulo de ar.js-next) para la geolocalización con renderizado de imagenes 2d o figuras 3d.

Ejemplo de prueba, creación del renderizado en puntos fijados en el Array, esto demuestra que mercator funciona.

<img width="281" height="607" alt="mercator" src="https://github.com/user-attachments/assets/c52f1531-c43f-48f9-b7bc-a89eb5443869" />

Una vez te acercas a los puntos marcados en el mapa empiezan a ser visibles las figuras.

El servidor de gitpages no encontro la ruta de la foto o yo puse la ruta mal, eso el lo de menos para un mvp. Pero el caso es que el renderizado con geolocalizacion real funciona.

<img width="280" height="611" alt="figura" src="https://github.com/user-attachments/assets/56b6483f-fedc-44e8-bdae-d44364f94717" />

Añadi el Método Haversine real en el repo nuevo y se puede ver la distancia entre yo y los puntos, esto demuestra que la brujula del móvil funciona y con una precisión increible.

<img width="277" height="607" alt="haversine" src="https://github.com/user-attachments/assets/036fa9c7-8d3f-4021-9bf6-5cbeaa3a8fa6" />

Al estar a 1m la figura se ve enorme. No hay Jitter.

##CUELLO DE BOTELLA:
La bateria se me agoto literalmente en 20 minutos. Casi un 40%
Da la impresión de que las figuras te siguen por el billboard, hay que añadir que lógica que aumente o reduzca los marcadores para eliminar este efecto
o reducir el filtrado a actualizaciones a menos de 15 metros.
Problema el GPS falla por 5 o 10 metros.





