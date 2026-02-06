import { GeoUtils } from '../utils/geo-utils.js';

AFRAME.registerComponent('poi-renderer', {
    schema: {
        active: { type: 'boolean', default: false }
    },

    init: function () {
        this.textEl = document.createElement('a-text');
        this.textEl.setAttribute('align', 'center');
        this.textEl.setAttribute('scale', '3 3 3');
        this.textEl.setAttribute('position', '0 1.5 0');
        this.textEl.setAttribute('color', '#FFFFFF');
        this.el.appendChild(this.textEl);

        this.el.setAttribute('geometry', 'primitive: plane; width: 1; height: 1');
        this.el.setAttribute('material', {
            shader: 'flat',
            transparent: true,
            side: 'double',
            opacity: 0
        });
        this.el.setAttribute('look-at', '[camera]');
        this.el.setAttribute('animation__fade', {
            property: 'material.opacity',
            from: 0,
            to: 1,
            dur: 500,
            startEvents: 'reveal',
            easing: 'linear'
        });

        this.currentModelUrl = '';
    },

    updateDirect: function (title, distanceMeters, modelUrl, active) {
        if (!active) {
            this.el.setAttribute('material', 'opacity', 0);
            return;
        }

        if (modelUrl !== this.currentModelUrl) {
            this.updateModel(modelUrl);
        }

        this.textEl.setAttribute('value', `${title}\n${distanceMeters}m`);
    },

    updateModel: function (modelUrl) {
        this.currentModelUrl = modelUrl;

        if (modelUrl && (modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf'))) {
            this.el.setAttribute('gltf-model', modelUrl);
            this.el.removeAttribute('geometry');
            this.el.removeAttribute('material');
            return;
        }

        this.el.removeAttribute('gltf-model');
        this.el.setAttribute('geometry', 'primitive: plane; width: 1; height: 1');

        const materialConfig = {
            shader: 'flat',
            transparent: true,
            side: 'double',
            opacity: 0,
            color: modelUrl ? '#FFFFFF' : '#FFA500'
        };

        if (modelUrl) materialConfig.src = modelUrl;

        this.el.setAttribute('material', materialConfig);
    },

    updateBearing: function (nextLat, nextLon) {
        const locarPlace = this.el.getAttribute('locar-entity-place');
        if (!locarPlace) return;

        const bearing = GeoUtils.calculateBearing(
            locarPlace.latitude, locarPlace.longitude,
            nextLat, nextLon
        );
        this.el.object3D.rotation.y = THREE.MathUtils.degToRad(-bearing);
    },

    deactivate: function () {
        this.el.object3D.visible = false;
        this.el.setAttribute('material', 'opacity', 0);
    },

    reveal: function () {
        this.el.emit('reveal');
    },

    update: function () {
        if (!this.data.active) {
            this.el.object3D.visible = false;
        }
    }
});
