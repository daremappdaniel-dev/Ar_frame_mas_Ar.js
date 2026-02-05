import './components/poi-renderer.js';
import './components/poi-manager.js';
import './components/route-manager.js';
import './components/nft-handler.js';

const POIS_DATA = [
    { name: "Punto 1: Inicio", lat: 40.654613, lon: -4.701812, model: "./assets/daremapp/marcador.png" },
    { name: "Punto 2: Curva", lat: 40.654966, lon: -4.701651, model: "./assets/daremapp/marcador.png" },
    { name: "Punto 3: Recta", lat: 40.654893, lon: -4.701083, model: "./assets/daremapp/marcador.png" },
    { name: "Punto 4: Casa", lat: 40.651649, lon: -4.695813, model: "./assets/daremapp/marcador.png" }
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
        }

        const routeManager = scene.systems['route-manager'];
        if (routeManager) {
            console.log("Cargando ruta en Route Manager...");
            routeManager.loadRoute(POIS_DATA);
        }
    });
};