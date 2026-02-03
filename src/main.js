import 'aframe';
import 'locar';
import 'locar-aframe';
import 'aframe-look-at-component';
import './components/place-marker.js';

window.onload = function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        staticLoadPlaces();
        setupGpsListener();
    });
};

function staticLoadPlaces() {
    const scene = document.querySelector('a-scene');
    const entity = document.createElement('a-entity');

    entity.setAttribute('locar-entity-place', {
        latitude: 40.6559441207,
        longitude: -4.6996381432
    });

    entity.setAttribute('place-marker', {
        name: "Logo DareMapp",
        model: "./assets/daremapp/marcador.png"
    });

    entity.setAttribute('scale', '15 15 15');
    scene.appendChild(entity);
}

function setupGpsListener() {
    const locarCamera = document.querySelector('[locar-camera]');
    if (locarCamera) {
        locarCamera.addEventListener('gpsupdate', (e) => {
            console.log("GPS Actualizado", e.detail.position.coords);
        });
    }
}