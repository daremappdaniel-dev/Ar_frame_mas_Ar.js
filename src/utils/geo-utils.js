export const GeoUtils = {
    toRad: (x) => x * Math.PI / 180,
    toDeg: (x) => x * 180 / Math.PI,
    calculateBearing: function (lat1, lon1, lat2, lon2) {
        const dLon = this.toRad(lon2 - lon1);
        const lat1Rad = this.toRad(lat1);
        const lat2Rad = this.toRad(lat2);

        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        return (this.toDeg(Math.atan2(y, x)) + 360) % 360;
    },
    haversine: function (lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
