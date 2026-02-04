AFRAME.registerSystem('poi-manager', {
    schema: {
        poolSize: { type: 'number', default: 20 },
        windowRadius: { type: 'number', default: 500 },
        defaultModel: { type: 'string', default: './assets/daremapp/flecha.png' }
    },

    init: function () {
        this.poisCount = 0;
        this.latitudes = null;
        this.longitudes = null;
        this.names = null;
        this.models = null;
        this.distances = null;

        this.poolEntities = [];
        this.userPosition = null;
        this.isPoolCreated = false;

        this.nearbyIndices = [];
        this.nearbyCount = 0;

        console.log('[POI-Manager] Sistema iniciado. Esperando escena...');

        const scene = this.el;
        if (scene.hasLoaded) {
            this.setupSystem();
        } else {
            scene.addEventListener('loaded', () => this.setupSystem());
        }
    },

    setupSystem: function () {
        this.createPool();
        this.setupGpsListeners();
        console.log(`[POI-Manager] Pool de ${this.data.poolSize} entidades creado.`);
    },

    createPool: function () {
        const scene = this.el;

        for (let i = 0; i < this.data.poolSize; i++) {
            const el = document.createElement('a-entity');

            el.setAttribute('poi-renderer', { active: false });
            el.setAttribute('scale', '15 15 15');
            el.setAttribute('id', `poi-pool-${i}`);

            scene.appendChild(el);
            this.poolEntities.push(el);
        }

        this.isPoolCreated = true;
    },

    setupGpsListeners: function () {
        const locarCameraEl = document.querySelector('[locar-camera]');

        if (!locarCameraEl) {
            console.warn('[POI-Manager] locar-camera no encontrado, reintentando...');
            setTimeout(() => this.setupGpsListeners(), 500);
            return;
        }

        const component = locarCameraEl.components['locar-camera'];

        if (!component?.locar) {
            console.log('[POI-Manager] Esperando inicializacion de locar...');
            setTimeout(() => this.setupGpsListeners(), 500);
            return;
        }

        console.log('[POI-Manager] GPS conectado. Configurando opciones...');
        component.locar.setGpsOptions({ gpsMinDistance: 5 });

        locarCameraEl.addEventListener('gps-initial-position-determined', () => {
            console.log('[POI-Manager] Posicion inicial GPS determinada.');
        });

        locarCameraEl.addEventListener('gpsupdate', (e) => {
            const coords = e.detail.position.coords;
            this.userPosition = {
                latitude: coords.latitude,
                longitude: coords.longitude
            };
            this.updateSlidingWindow();
        });

        locarCameraEl.addEventListener('gpserror', (err) => {
            console.error('[POI-Manager] Error GPS critico:', err);
        });
    },

    loadPois: function (poisArray) {
        const count = poisArray.length;
        this.poisCount = count;

        this.latitudes = new Float64Array(count);
        this.longitudes = new Float64Array(count);
        this.names = new Array(count);
        this.models = new Array(count);
        this.distances = new Float64Array(count);

        for (let i = 0; i < count; i++) {
            this.latitudes[i] = poisArray[i].lat;
            this.longitudes[i] = poisArray[i].lon;
            this.names[i] = poisArray[i].name;
            this.models[i] = poisArray[i].model || null;
        }

        console.log(`[POI-Manager] Cargados ${count} POIs en memoria (SoA).`);

        if (this.userPosition) {
            this.updateSlidingWindow();
        }
    },

    updateSlidingWindow: function () {
        if (!this.userPosition || !this.isPoolCreated || this.poisCount === 0) return;

        this.nearbyCount = 0;
        const userLat = this.userPosition.latitude;
        const userLon = this.userPosition.longitude;
        const radius = this.data.windowRadius;

        for (let i = 0; i < this.poisCount; i++) {
            const distance = this.haversine(userLat, userLon, this.latitudes[i], this.longitudes[i]);
            this.distances[i] = distance;

            if (distance <= radius) {
                this.nearbyIndices[this.nearbyCount++] = i;
            }
        }

        this.nearbyIndices.length = this.nearbyCount;
        this.nearbyIndices.sort((a, b) => this.distances[a] - this.distances[b]);

        this.renderPool();
    },

    renderPool: function () {
        for (let i = 0; i < this.data.poolSize; i++) {
            const entity = this.poolEntities[i];
            const renderer = entity.components['poi-renderer'];

            if (i < this.nearbyCount) {
                const idx = this.nearbyIndices[i];
                const nextIdx = (i + 1 < this.nearbyCount) ? this.nearbyIndices[i + 1] : -1;

                entity.setAttribute('locar-entity-place', {
                    latitude: this.latitudes[idx],
                    longitude: this.longitudes[idx]
                });

                if (renderer) {
                    renderer.updateDirect(
                        this.names[idx],
                        Math.round(this.distances[idx]),
                        this.models[idx] || this.data.defaultModel,
                        true,
                        nextIdx >= 0 ? this.latitudes[nextIdx] : 0,
                        nextIdx >= 0 ? this.longitudes[nextIdx] : 0,
                        nextIdx >= 0
                    );
                }

            } else {
                if (renderer) {
                    renderer.deactivate();
                }
                entity.removeAttribute('locar-entity-place');
            }
        }
    },

    haversine: function (lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const toRad = x => x * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
});
