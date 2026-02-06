export const GeoUtils = {
    EARTH_RADIUS: 6378137,

    haversine: function (lat1, lon1, lat2, lon2) {
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.EARTH_RADIUS * c;
    },

    latLonToMercator: function (lat, lon) {
        const x = lon * Math.PI / 180 * this.EARTH_RADIUS;
        const y = Math.log(Math.tan((lat * Math.PI / 180) / 2 + Math.PI / 4)) * this.EARTH_RADIUS;
        return { x, y };
    },

    latLonToLocalCartesian: function (lat, lon, originLat, originLon) {
        const dLat = (lat - originLat) * Math.PI / 180;
        const dLon = (lon - originLon) * Math.PI / 180;
        const x = dLon * Math.cos(originLat * Math.PI / 180) * this.EARTH_RADIUS;
        const z = -(dLat * this.EARTH_RADIUS);
        return { x, z };
    },

    calculateBearing: function (lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        let brng = Math.atan2(y, x);
        brng = (brng * 180 / Math.PI + 360) % 360;
        return brng;
    }
};
