import 'aframe';
import 'locar';
import 'locar-aframe';
import 'aframe-look-at-component';
import './components/place-marker.js';

window.onload = function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        setupGpsListener();
    });
};

let placesLoaded = false;

function staticLoadPlaces() {
    const scene = document.querySelector('a-scene');

    const places = [
        { name: "Punto 1", lat: 40.654202, lon: -4.697044 },
        { name: "Punto 2", lat: 40.654132, lon: -4.697073 },
        { name: "Punto 3", lat: 40.654071, lon: -4.697097 },
        { name: "Punto 4", lat: 40.654259, lon: -4.697023 }
    ];

    console.log("Cargando " + places.length + " marcadores...");

    places.forEach(place => {
        const entity = document.createElement('a-entity');

        entity.setAttribute('locar-entity-place', {
            latitude: place.lat,
            longitude: place.lon
        });

        entity.setAttribute('place-marker', {
            name: place.name,
            model: "./assets/daremapp/marcador.png"
        });

        entity.setAttribute('scale', '15 15 15');
        scene.appendChild(entity);
    });
}

function setupGpsListener() {
    const locarCameraEl = document.querySelector('[locar-camera]');

    if (locarCameraEl) {
        const component = locarCameraEl.components['locar-camera'];

        if (component && component.locar) {
            console.log("Filtro GPS: 15 metros");
            component.locar.setGpsOptions({ gpsMinDistance: 15 });

            if (component.hasPosition || component.locar.lastPosition) {
                console.log("GPS listo (cache)");
                if (!placesLoaded) {
                    staticLoadPlaces();
                    placesLoaded = true;
                }
            }
        } else {
            setTimeout(setupGpsListener, 500);
            return;
        }

        locarCameraEl.addEventListener('gps-initial-position-determined', (e) => {
            console.log("GPS inicial OK");
            if (!placesLoaded) {
                staticLoadPlaces();
                placesLoaded = true;
            }
        });

        locarCameraEl.addEventListener('gpsupdate', (e) => {
            console.log("GPS update: " + e.detail.position.coords.latitude + ", " + e.detail.position.coords.longitude);
            if (!placesLoaded) {
                staticLoadPlaces();
                placesLoaded = true;
            }
        });

        setInterval(() => {
            if (!placesLoaded && component.locar && component.locar.lastPosition) {
                console.log("GPS fallback polling");
                staticLoadPlaces();
                placesLoaded = true;
            }
        }, 2000);
    }
}