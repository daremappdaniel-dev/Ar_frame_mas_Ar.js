AFRAME.registerSystem('place-marker', {
    init: function () {
        this.markers = [];
        this.cameraEl = document.querySelector('[locar-camera]');
    },


    registerMarker: function (marker) {
        this.markers.push(marker);
        console.log(`Sistema: Marcador "${marker.data.name}" registrado.`);
    },

    unregisterMarker: function (marker) {
        const index = this.markers.indexOf(marker);
        if (index > -1) this.markers.splice(index, 1);
    },


    tick: function () {
        if (!this.cameraEl) return;
        const camPos = this.cameraEl.object3D.position;

        this.markers.forEach(marker => {
            const dist = marker.el.object3D.position.distanceTo(camPos);
            if (dist < 15) {
                marker.onNear();
            } else {
                marker.onFar();
            }
        });
    }
});

AFRAME.registerComponent('place-marker', {
    schema: {
        name: { type: 'string', default: 'Lugar Desconocido' },
        model: { type: 'asset' }
    },

    init: function () {
        const el = this.el;
        const modelUrl = this.data.model;

        if (modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf')) {
            el.setAttribute('gltf-model', modelUrl);
        } else {
            el.setAttribute('geometry', 'primitive: plane; width: 1; height: 1');
            el.setAttribute('material', {
                shader: 'flat',
                src: modelUrl,
                transparent: true,
                side: 'double'
            });
        }

        el.setAttribute('look-at', '[camera]');

        const debugCube = document.createElement('a-entity');
        debugCube.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.5; depth: 0.5');
        debugCube.setAttribute('material', 'color: red');
        debugCube.setAttribute('position', '0 1 0');
        el.appendChild(debugCube);

        this.system.registerMarker(this);
    },

    onNear: function () {
        if (!this.isNear) {
            console.log(`¡Cerca de ${this.data.name}!`);
            this.el.setAttribute('scale', '20 20 20');
            this.isNear = true;
        }
    },

    onFar: function () {
        if (this.isNear) {
            this.el.setAttribute('scale', '15 15 15');
            this.isNear = false;
        }
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});