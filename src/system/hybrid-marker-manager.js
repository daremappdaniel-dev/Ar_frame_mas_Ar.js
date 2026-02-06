import { GeoUtils } from '../utils/geo_utils.js';

AFRAME.registerSystem('hybrid-marker-manager', {
    schema: {
        radius: { type: 'number', default: 100 }
    },

    init: function () {
        this.markers = [];
        this.statusText = document.querySelector('#status-text');

        window.addEventListener('gps-camera-update-position', (e) => {
            this.updateProximity(e.detail.position);
        });

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => this.updateProximity(pos.coords),
                null,
                { enableHighAccuracy: true }
            );
        }
    },

    registerMarker: function (marker) {
        this.markers.push(marker);
    },

    unregisterMarker: function (marker) {
        const index = this.markers.indexOf(marker);
        if (index > -1) this.markers.splice(index, 1);
    },

    updateProximity: function (userPos) {
        this.markers.forEach(marker => {
            const dist = GeoUtils.haversine(
                userPos.latitude, userPos.longitude,
                marker.data.lat, marker.data.lon
            );

            const isNear = dist <= (marker.data.radius || this.data.radius);
            marker.setNear(isNear, dist);
        });
    }
});
