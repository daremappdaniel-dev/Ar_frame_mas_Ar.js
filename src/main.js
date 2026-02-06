
import 'aframe';
import 'aframe-look-at-component';
import 'locar';
import 'locar-aframe';

import './components/poi-renderer.js';
import './systems/poi-manager.js';
import './systems/route-manager.js';
import { POIS_DATA } from './data/pois-data.js';

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