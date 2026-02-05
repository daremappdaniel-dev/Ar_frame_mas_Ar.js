AFRAME.registerSystem('poi-manager', {
    schema: {
        poolSize: { type: 'number', default: 20 },
        windowRadius: { type: 'number', default: 500 },
        proximityRadius: { type: 'number', default: 15 },
        defaultModel: { type: 'string', default: '' }
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
            el.setAttribute('scale', '0 0 0');
            el.setAttribute('position', '0 0 0');
            el.setAttribute('material', { shader: 'flat', transparent: true, opacity: 0 });
            el.setAttribute('id', `poi-pool-${i}`);
            el.object3D.visible = false;

            scene.appendChild(el);
            this.poolEntities.push(el);
        }

        this.isPoolCreated = true;
        console.log('[POI-Manager] Pool de entidades listo.');
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
            const isActive = i < this.nearbyCount;

            if (isActive) {
                this.activatePoolEntity(entity, i);

                const idx = this.nearbyIndices[i];
                const distance = this.distances[idx];

                if (entity.getAttribute('scale').x > 0) {
                    const isVisibleByProximity = distance <= this.data.proximityRadius;
                    entity.object3D.visible = isVisibleByProximity;

                }

            } else {
                this.deactivatePoolEntity(entity);
            }
        }
    },

    activatePoolEntity: function (entity, poolIndex) {
        console.log(`[POI-Manager] ACTIVANDO POI Slot ${poolIndex}`);
        const idx = this.nearbyIndices[poolIndex];
        const nextIdx = this.getNextPoiIndex(poolIndex);

        entity.setAttribute('scale', '0 0 0');
        entity.object3D.visible = true;
        console.log(`[POI-Manager] POI Slot ${poolIndex}: Visible=true (Logico), pero Escala=0`);

        const renderer = entity.components['poi-renderer'];
        if (renderer) {
            const name = this.names[idx];
            console.log(`[POI-Manager] POI Slot ${poolIndex}: Asignando nombre "${name}"`);
            const dist = Math.round(this.distances[idx]);
            const model = this.models[idx] || this.data.defaultModel;
            const hasNext = nextIdx >= 0;
            const nLat = hasNext ? this.latitudes[nextIdx] : 0;
            const nLon = hasNext ? this.longitudes[nextIdx] : 0;

            renderer.updateDirect(name, dist, model, true, nLat, nLon, hasNext);
        }

        entity.setAttribute('locar-entity-place', {
            latitude: this.latitudes[idx],
            longitude: this.longitudes[idx]
        });

        entity.addEventListener('object-placed', () => {
            console.log(`[POI-Manager] EVENTO: object-placed recibido para Slot ${poolIndex}`);
            setTimeout(() => {
                if (entity.getAttribute('locar-entity-place')) {
                    entity.setAttribute('scale', '15 15 15');
                    entity.setAttribute('material', 'opacity', 1);

                    const distCheck = entity.components['poi-renderer']?.dist || 9999;
                    const isVisibleByProximity = distCheck <= this.data.proximityRadius;

                    if (isVisibleByProximity) {
                        console.log(`[POI-Manager] POI Slot ${poolIndex}: MOSTRANDO (Big Bang + Proximidad OK)`);
                        if (renderer) {
                            renderer.el.object3D.visible = true;
                            renderer.reveal();
                        }
                    } else {
                        console.log(`[POI-Manager] POI Slot ${poolIndex}: ACTIVO pero LEJOS (${distCheck}m > ${this.data.proximityRadius}m). Invisible.`);
                        entity.object3D.visible = false;
                    }

                } else {
                    console.warn(`[POI-Manager] POI Slot ${poolIndex}: Cancelado (ya no es activo)`);
                }
            }, 500);
        }, { once: true });
    },

    deactivatePoolEntity: function (entity) {
        const renderer = entity.components['poi-renderer'];
        if (renderer) {
            renderer.deactivate();
        }
        entity.setAttribute('scale', '0 0 0');
        entity.setAttribute('material', 'opacity', 0);
        entity.setAttribute('position', '0 0 0');
        entity.removeAttribute('locar-entity-place');
    },

    getNextPoiIndex: function (poolIndex) {
        const nextPoolIndex = poolIndex + 1;
        return nextPoolIndex < this.nearbyCount ? this.nearbyIndices[nextPoolIndex] : -1;
    },

    haversine: function (lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const toRad = x => x * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        console.log(`[GPS-Debug] Distancia calculada: ${dist.toFixed(2)}m`);
        return dist;
    }
});
