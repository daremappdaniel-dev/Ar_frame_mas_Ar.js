import 'aframe';
import 'locar';
import 'locar-aframe';
import 'aframe-look-at-component';
import './components/place-marker.js';

window.onload = function () {
    console.log("Iniciando aplicacion AR...");
    const scene = document.querySelector('a-scene');

    scene.addEventListener('loaded', function () {
        console.log("Escena A-Frame cargada");
        setupGpsListener();
    });

    scene.addEventListener('rendererresize', function () {
        console.log("Redimensionamiento de renderer detectado");
    });
};

let placesLoaded = false;
const places = [
    { name: "Punto 1", lat: 40.654202, lon: -4.697044 },
    { name: "Punto 2", lat: 40.654132, lon: -4.697073 },
    { name: "Punto 3", lat: 40.654071, lon: -4.697097 },
    { name: "Punto 4", lat: 40.654259, lon: -4.697023 }
];

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function staticLoadPlaces() {
    const scene = document.querySelector('a-scene');

    console.log(`Cargando ${places.length} marcadores en el mapa...`);

    places.forEach((place, index) => {
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
        entity.setAttribute('id', `marker-${index}`);

        scene.appendChild(entity);
        console.log(`Marcador anadido: ${place.name} [${place.lat}, ${place.lon}]`);
    });
}

function setupGpsListener() {
    const locarCameraEl = document.querySelector('[locar-camera]');

    if (!locarCameraEl) {
        console.warn("Elemento locar-camera no encontrado, reintentando...");
        setTimeout(setupGpsListener, 500);
        return;
    }

    const component = locarCameraEl.components['locar-camera'];

    if (!component || !component.locar) {
        console.log("Esperando inicializacion de componente locar...");
        setTimeout(setupGpsListener, 500);
        return;
    }

    console.log("Sistema GPS iniciado correctamente. Configurando opciones...");
    component.locar.setGpsOptions({ gpsMinDistance: 5 });

    locarCameraEl.addEventListener('gps-initial-position-determined', (e) => {
        console.log("GPS Posicion Inicial Determinada");
        if (!placesLoaded) {
            staticLoadPlaces();
            placesLoaded = true;
        }
    });

    locarCameraEl.addEventListener('gpsupdate', (e) => {
        const coords = e.detail.position.coords;
        console.log(`GPS Update: Lat: ${coords.latitude.toFixed(6)}, Lon: ${coords.longitude.toFixed(6)} (Precision: ${coords.accuracy}m)`);

        if (placesLoaded) {
            places.forEach(place => {
                const dist = getDistanceFromLatLonInM(coords.latitude, coords.longitude, place.lat, place.lon);
                if (dist < 100) {
                    console.log(`Distancia a ${place.name}: ${dist.toFixed(1)} metros`);
                }
            });
        }

        if (!placesLoaded) {
            staticLoadPlaces();
            placesLoaded = true;
        }
    });

    locarCameraEl.addEventListener('gpserror', (err) => {
        console.error("Error de GPS critico:", err);
        alert("Error de GPS: " + (err.message || JSON.stringify(err)));
    });

    setInterval(() => {
        if (!placesLoaded && component.locar && component.locar.lastPosition) {
            console.warn("Usando fallback de polling para carga de lugares");
            staticLoadPlaces();
            placesLoaded = true;
        }
    }, 3000);
}