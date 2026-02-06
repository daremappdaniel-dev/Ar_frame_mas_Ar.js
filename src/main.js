
import 'aframe';
import 'aframe-look-at-component';
import 'locar';
import 'locar-aframe';
import 'aframe-look-at-component';
import './components/poi-renderer.js';
import './components/place-marker.js';
import './components/hybrid-marker-adapter.js';
import './system/poi-manager.js';
import './system/route-manager.js';
import './system/hybrid-marker-manager.js';
import { poisData } from './data/pois-data.js';

window.onload = function () {
    console.log("Iniciando aplicacion AR con arquitectura ECS...");
    const scene = document.querySelector('a-scene');

    scene.addEventListener('loaded', function () {
        console.log("Escena A-Frame cargada");

        const poiManager = scene.systems['poi-manager'];
        if (poiManager) {
            poiManager.loadPois(poisData);
            console.log("POIs cargados en el sistema de gestion.");
        }

        const routeManager = scene.systems['route-manager'];
        if (routeManager) {
            console.log("Cargando ruta en Route Manager...");
            routeManager.loadRoute(poisData);
        }
    });
};