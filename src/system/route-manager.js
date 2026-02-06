AFRAME.registerSystem('route-manager', {
    schema: {
        color: { type: 'color', default: '#0055FF' },
        width: { type: 'number', default: 0.5 },
        opacity: { type: 'number', default: 0.8 },
        heightOffset: { type: 'number', default: 0.2 }
    },

    init: function () {
        this.routeMesh = null;
        this.pathPoints = [];
        console.log('[Route-Manager] Sistema de Navegación Híbrido iniciado.');
    },

    loadRoute: function (gpsCoordinates) {

        const locarCamera = document.querySelector('[locar-camera]');
        if (!locarCamera || !locarCamera.components['locar-camera']?.locar) {
            console.log('[Route-Manager] Esperando a LocAR...');
            setTimeout(() => this.loadRoute(gpsCoordinates), 500);
            return;
        }

        const locar = locarCamera.components['locar-camera'].locar;

        this.pathPoints = gpsCoordinates.map(coord => {
            const dummy = document.createElement('a-entity');
            dummy.setAttribute('gps-projected-entity-place', {
                latitude: coord.lat,
                longitude: coord.lon
            });
            return this.projectGPS(locar, coord.lat, coord.lon);
        });


        this.createPathMesh();
    },

    projectGPS: function (locar, lat, lon) {

        if (!this.routeOrigin) {
            this.routeOrigin = { lat: lat, lon: lon };
            return new THREE.Vector3(0, 0, 0);
        }

        const R = 6371000;
        const dLat = (lat - this.routeOrigin.lat) * Math.PI / 180;
        const dLon = (lon - this.routeOrigin.lon) * Math.PI / 180;
        const lat1 = this.routeOrigin.lat * Math.PI / 180;

        const x = R * dLon * Math.cos(lat1);
        const z = -1 * R * dLat;

        return new THREE.Vector3(x, 0, z);
    },



    createPathMesh: function () {
        if (!this.pathPoints || this.pathPoints.length < 2) return;

        if (this.routeMesh) {
            this.el.object3D.remove(this.routeMesh);
        }

        const curve = new THREE.CatmullRomCurve3(this.pathPoints);
        curve.curveType = 'centripetal';
        curve.tension = 0.5;


        const geometry = new THREE.TubeGeometry(curve, this.pathPoints.length * 15, 1.5, 8, false);

        const material = new THREE.MeshBasicMaterial({
            color: '#0077FF',
            opacity: 0.6,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const routeAnchor = document.createElement('a-entity');

        if (this.routeOrigin) {
            routeAnchor.setAttribute('gps-projected-entity-place', {
                latitude: this.routeOrigin.lat,
                longitude: this.routeOrigin.lon
            });
        }

        this.routeMesh = new THREE.Mesh(geometry, material);
        this.routeMesh.scale.set(1, 0.001, 1);
        this.routeMesh.position.y = -1.0;

        routeAnchor.object3D.add(this.routeMesh);
        this.el.appendChild(routeAnchor);
        this.routeAnchorEntity = routeAnchor;

        console.log('[Route-Manager] Cinta de ruta generada.');
    }
});
