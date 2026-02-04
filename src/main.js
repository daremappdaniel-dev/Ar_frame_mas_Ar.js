import 'aframe';
import 'locar';
import 'locar-aframe';
import 'aframe-look-at-component';
import './components/poi-renderer.js';
import './components/poi-manager.js';

const POIS_DATA = [
    { name: "Punto 1", lat: 40.654202, lon: -4.697044 },
    { name: "Punto 2", lat: 40.654132, lon: -4.697073 },
    { name: "Punto 3", lat: 40.654071, lon: -4.697097 },
    { name: "Punto 4", lat: 40.654259, lon: -4.697023 }
];

window.onload = function () {
    console.log("Iniciando aplicacion AR con arquitectura ECS...");
    const scene = document.querySelector('a-scene');

    scene.addEventListener('loaded', function () {
        console.log("Escena A-Frame cargada");

        const poiManager = scene.systems['poi-manager'];
        if (poiManager) {
            poiManager.loadPois(POIS_DATA);
            console.log("POIs cargados en el sistema de gestion.");
        } else {
            console.warn("Sistema poi-manager no encontrado. Reintentando...");
            setTimeout(() => {
                const retryManager = scene.systems['poi-manager'];
                if (retryManager) {
                    retryManager.loadPois(POIS_DATA);
                }
            }, 1000);
        }
    });
};

window.simulateGPS = function (lat, lon) {
    const scene = document.querySelector('a-scene');
    const poiManager = scene?.systems['poi-manager'];

    if (!poiManager) {
        console.error('Sistema poi-manager no encontrado');
        return;
    }

    poiManager.userPosition = {
        latitude: lat,
        longitude: lon
    };
    poiManager.updateSlidingWindow();

    console.log(`GPS Simulado: Lat ${lat}, Lon ${lon}`);
    console.log(`POIs cercanos: ${poiManager.nearbyPOIsBuffer.length}`);
};