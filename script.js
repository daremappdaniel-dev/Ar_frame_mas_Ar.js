window.onload = function() {
    const scene = document.querySelector('a-scene');
    
    scene.addEventListener('loaded', function() {
        staticLoadPlaces();
    });
};

function staticLoadPlaces() {
    const place = {
        name: "DareMapp Logo",
        // oficina
        latitude: 40.65574412076483,
        longitude: -4.699638143293775,
        model: "./assets/daremapp/daremapp_logo.glb",
        scale: "50 50 50",
        rotation: "0 0 0"
    };

    const scene = document.querySelector('a-scene');
    
    const entity = document.createElement('a-entity');
    entity.setAttribute('id', 'daremapp-logo');
    entity.setAttribute('gltf-model', place.model);
    entity.setAttribute('gps-entity-place', `latitude: ${place.latitude}; longitude: ${place.longitude};`);

    entity.setAttribute('scale', place.scale);
    entity.setAttribute('rotation', place.rotation);
    
    scene.appendChild(entity);
    
    entity.addEventListener('loaded', function() {
        freezePositionAfterDelay(entity, 5000);
    });
}

function freezePositionAfterDelay(entity, delay) {
    setTimeout(function() {
        const currentPosition = entity.getAttribute('position');
        
        const frozenPos = {
            x: currentPosition.x,
            y: currentPosition.y,
            z: currentPosition.z
        };

        const observer = new MutationObserver(function(mutations) {
            const newPos = entity.getAttribute('position');
            if (newPos.x !== frozenPos.x || newPos.y !== frozenPos.y || newPos.z !== frozenPos.z) {
                entity.setAttribute('position', frozenPos);
            }
        });
        
        observer.observe(entity, { 
            attributes: true, 
            attributeFilter: ['position'] 
        });
        
        alert("GPS position frozen");
        
    }, delay);
}
