
window.onload = function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        staticLoadPlaces();
    });
};

function staticLoadPlaces() {
    const place = {
        name: "DareMapp Logo",
        latitude: 40.65416079190461,
        longitude: -4.696458373056158,
        model: "./assets/daremapp/daremapp_logo.glb",
        scale: "15 15 15",
        rotation: "0 0 0"
    };

    const scene = document.querySelector('a-scene');

    const entity = document.createElement('a-entity');
    entity.setAttribute('id', 'daremapp-logo');
    entity.setAttribute('gltf-model', place.model);

    entity.setAttribute('gps-new-entity-place', {
        latitude: place.latitude,
        longitude: place.longitude
    });

    entity.setAttribute('scale', place.scale);
    entity.setAttribute('rotation', place.rotation);
    entity.setAttribute('look-at', '[gps-new-camera]'); 

    scene.appendChild(entity);
}