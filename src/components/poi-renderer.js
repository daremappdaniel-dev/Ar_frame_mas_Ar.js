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
            opacity: 0.9
        });
        this.el.setAttribute('look-at', '[camera]');

        this.currentModelUrl = '';
        this.textComponent = this.textEl.components.text;
    },

    updateDirect: function (title, distanceMeters, modelUrl, active, nextLat, nextLon, hasNext) {
        this.el.object3D.visible = active;
        if (!active) return;

        if (modelUrl !== this.currentModelUrl) {
            this.currentModelUrl = modelUrl;

            if (modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf')) {
                this.el.setAttribute('gltf-model', modelUrl);
                this.el.removeAttribute('geometry');
                this.el.removeAttribute('material');
            } else {
                this.el.removeAttribute('gltf-model');
                this.el.setAttribute('geometry', 'primitive: plane; width: 1; height: 1');
                this.el.setAttribute('material', {
                    shader: 'flat',
                    src: modelUrl,
                    transparent: true,
                    side: 'double'
                });
            }
        }

        const textObj = this.textEl.components.text;
        if (textObj) {
            textObj.data.value = `${title}\n${distanceMeters}m`;
            textObj.update();
        } else {
            this.textEl.setAttribute('value', `${title}\n${distanceMeters}m`);
        }

        if (hasNext) {
            const locarPlace = this.el.getAttribute('locar-entity-place');
            if (locarPlace) {
                const bearing = this.calculateBearing(
                    locarPlace.latitude, locarPlace.longitude,
                    nextLat, nextLon
                );
                this.el.object3D.rotation.y = THREE.MathUtils.degToRad(-bearing);
            }
        }
    },

    deactivate: function () {
        this.el.object3D.visible = false;
    },

    update: function () {
        if (!this.data.active) {
            this.el.object3D.visible = false;
        }
    },

    calculateBearing: function (lat1, lon1, lat2, lon2) {
        const toRad = x => x * Math.PI / 180;
        const toDeg = x => x * 180 / Math.PI;

        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

        return (toDeg(Math.atan2(y, x)) + 360) % 360;
    }
});
