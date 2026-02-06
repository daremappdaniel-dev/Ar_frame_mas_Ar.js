AFRAME.registerComponent('hybrid-marker-adapter', {
    schema: {
        lat: { type: 'number' },
        lon: { type: 'number' },
        radius: { type: 'number', default: 100 }
    },

    init: function () {
        this.el.setAttribute('visible', false);
        this.system.registerMarker(this);
        this.statusText = document.querySelector('#status-text');
    },

    setNear: function (isNear, distance) {
        this.el.setAttribute('visible', isNear);

        if (this.statusText && isNear) {
            const status = `¡CERCA! (${Math.round(distance)}m). Escanea.`;
            this.statusText.setAttribute('value', status);
            this.statusText.setAttribute('color', '#00FF00');
        }
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});
