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
    const entity = document.createElement('a-entity');

    entity.setAttribute('locar-entity-place', {
        latitude: 40.995135137639654,
        longitude: -5.719224031925429
    });

    entity.setAttribute('place-marker', {
        name: "Logo DareMapp",
        model: "./assets/daremapp/marcador.png"
    });

    entity.setAttribute('scale', '15 15 15');
    scene.appendChild(entity);
}

function setupGpsListener() {
    const locarCameraEl = document.querySelector('[locar-camera]');

    if (locarCameraEl) {
        const component = locarCameraEl.components['locar-camera'];

        if (component && component.locar) {
            console.log("Configurando filtro GPS nativo a 25 metros...");
            component.locar.setGpsOptions({ gpsMinDistance: 25 });
        } else {
            setTimeout(setupGpsListener, 500);
            return;
        }

        locarCameraEl.addEventListener('gps-initial-position-determined', (e) => {
            console.log("GPS: Posición inicial determinada. Cargando mundo AR...");
            if (!placesLoaded) {
                staticLoadPlaces();
                placesLoaded = true;
            }
        });

        locarCameraEl.addEventListener('gpsupdate', (e) => {
            const pos = e.detail.position.coords;
            console.log("GPS Nativo Actualizado (Filtro > 25m):", pos);

            if (!placesLoaded) {
                console.log("Primera señal GPS recibida. Cargando mundo AR (Fallback)...");
                staticLoadPlaces();
                placesLoaded = true;
            }
        });
    }
}