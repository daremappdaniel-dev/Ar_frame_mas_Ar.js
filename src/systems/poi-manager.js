import { GeoUtils } from '../utils/geo-utils.js';

AFRAME.registerSystem('poi-manager', {
    schema: {
        poolSize: { type: 'number', default: 20 },
        windowRadius: { type: 'number', default: 500 },
        proximityRadius: { type: 'number', default: 11 },
        defaultModel: { type: 'string', default: '' }
    },

    init: function () {
        this.totalPois = 0;
        this.latitudes = null;
        this.longitudes = null;
        this.names = [];
        this.models = [];
        this.firstFix = false;

        this.poolEntities = [];
        this.userPosition = null;
        this.isPoolCreated = false;

        this.distBuffer = null;
        this.indicesBuffer = null;

        this.retries = 0;
        this.maxRetries = 10;

        console.log('[POI-Manager] Sistema iniciado.');

        const scene = this.el;
        if (scene.hasLoaded) {
            this.setupSystem();
        } else {
            scene.addEventListener('loaded', () => this.setupSystem());
        }
    },

    setupSystem: function () {
        this.createPool();
        this.setupLocARListeners();
        console.log(`[POI-Manager] Pool de ${this.data.poolSize} entidades creado. Sistema LocAR activo.`);
    },

    loadPois: function (externalData) {
        if (externalData && Array.isArray(externalData)) {
            const count = externalData.length;
            this.totalPois = count;

            this.latitudes = new Float32Array(count);
            this.longitudes = new Float32Array(count);
            this.distBuffer = new Float32Array(count);
            this.indicesBuffer = new Uint16Array(count);
            this.names = new Array(count);
            this.models = new Array(count);

            for (let i = 0; i < count; i++) {
                this.latitudes[i] = externalData[i].lat;
                this.longitudes[i] = externalData[i].lon;
                this.names[i] = externalData[i].name || `POI ${i}`;
                this.models[i] = externalData[i].model || this.data.defaultModel;
                this.indicesBuffer[i] = i;
            }
            console.log(`[POI-Manager] ${count} POIs cargados desde fuente externa.`);
        } else {
            this.loadMockData();
        }

        if (this.userPosition) {
            this.updateSlidingWindow();
        }
    },

    loadMockData: function () {
        const MOCK_COUNT = 100;
        this.totalPois = MOCK_COUNT;

        this.latitudes = new Float32Array(MOCK_COUNT);
        this.longitudes = new Float32Array(MOCK_COUNT);
        this.distBuffer = new Float32Array(MOCK_COUNT);
        this.indicesBuffer = new Uint16Array(MOCK_COUNT);
        this.names = new Array(MOCK_COUNT);
        this.models = new Array(MOCK_COUNT);

        const baseLat = 40.416775;
        const baseLon = -3.703790;

        for (let i = 0; i < MOCK_COUNT; i++) {
            this.latitudes[i] = baseLat + (Math.random() - 0.5) * 0.01;
            this.longitudes[i] = baseLon + (Math.random() - 0.5) * 0.01;
            this.names[i] = `POI #${i}`;
            this.models[i] = '';
            this.indicesBuffer[i] = i;
        }
        console.log(`[POI-Manager] ${MOCK_COUNT} Mock POIs generados.`);
    },

    createPool: function () {
        const scene = this.el;
        for (let i = 0; i < this.data.poolSize; i++) {
            const el = document.createElement('a-entity');

            el.setAttribute('visible', false);
            el.setAttribute('scale', '0 0 0');
            el.setAttribute('position', '0 -10000 0');

            el.setAttribute('poi-renderer', { active: false });
            el.setAttribute('id', `poi-pool-${i}`);

            el.setAttribute('look-at', '[camera]');

            scene.appendChild(el);
            this.poolEntities.push(el);
        }
        this.isPoolCreated = true;
    },

    setupLocARListeners: function () {
        const locarCameraEl = document.querySelector('[locar-camera]');

        if (!locarCameraEl) {
            this.retries++;
            if (this.retries >= this.maxRetries) {
                console.error('[POI-Manager] ABORTADO: locar-camera no encontrada tras ' + this.maxRetries + ' intentos.');
                console.error('[POI-Manager] Asegúrate de que la entidad cámara tenga el atributo "locar-camera".');
                return;
            }
            console.warn(`[POI-Manager] Waiting for locar-camera... (${this.retries}/${this.maxRetries})`);
            setTimeout(() => this.setupLocARListeners(), 1000);
            return;
        }

        const component = locarCameraEl.components['locar-camera'];
        if (!component?.locar) {
            this.retries++;
            if (this.retries >= this.maxRetries) {
                console.error('[POI-Manager] ABORTADO: LocAR no se inicializó tras ' + this.maxRetries + ' intentos.');
                return;
            }
            console.warn(`[POI-Manager] LocAR not ready, retrying... (${this.retries}/${this.maxRetries})`);
            setTimeout(() => this.setupLocARListeners(), 500);
            return;
        }

        this.retries = 0;
        console.log('[POI-Manager] GPS/LocAR conectado correctamente.');

        locarCameraEl.addEventListener('gpsupdate', (e) => {
            if (e.detail?.position?.coords) {
                const { latitude, longitude, accuracy } = e.detail.position.coords;

                if (!this.firstFix) {
                    console.log(`[GPS-FIX] ¡Te encontré!`);
                    console.log(`[GPS-FIX] Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
                    console.log(`[GPS-FIX] Precisión: ${Math.round(accuracy)} metros`);
                    this.firstFix = true;
                }

                this.userPosition = { latitude, longitude };
                this.updateSlidingWindow();
            }
        });
    },

    updateSlidingWindow: function () {
        if (!this.userPosition || !this.latitudes) return;

        const userLat = this.userPosition.latitude;
        const userLon = this.userPosition.longitude;

        for (let i = 0; i < this.totalPois; i++) {
            this.distBuffer[i] = GeoUtils.haversine(userLat, userLon, this.latitudes[i], this.longitudes[i]);
            this.indicesBuffer[i] = i;
        }

        this.indicesBuffer.sort((a, b) => this.distBuffer[a] - this.distBuffer[b]);

        this.renderPool();
    },

    renderPool: function () {
        for (let i = 0; i < this.poolEntities.length; i++) {
            const entity = this.poolEntities[i];
            const dataIndex = this.indicesBuffer[i];
            const distance = this.distBuffer[dataIndex];

            const inWindow = i < this.totalPois && distance <= this.data.windowRadius;
            const tooClose = distance < this.data.proximityRadius;

            if (inWindow) {
                if (!tooClose) {
                    console.log(`[Field-Test] MOSTRANDO: ${this.names[dataIndex]} | Distancia: ${Math.round(distance)}m`);
                    this.activatePoolEntity(entity, dataIndex, distance);
                } else {
                    console.log(`[Field-Test] OCULTO (Muy cerca): ${this.names[dataIndex]} | Distancia: ${Math.round(distance)}m (< ${this.data.proximityRadius}m)`);
                    this.deactivatePoolEntity(entity);
                }
            } else {
                this.deactivatePoolEntity(entity);
            }
        }
    },

    activatePoolEntity: function (entity, dataIndex, distance) {
        const lat = this.latitudes[dataIndex];
        const lon = this.longitudes[dataIndex];
        const name = this.names[dataIndex];
        const model = this.models[dataIndex] || this.data.defaultModel;

        entity.setAttribute('locar-entity-place', {
            latitude: lat,
            longitude: lon
        });

        const renderer = entity.components['poi-renderer'];
        if (renderer) {
            renderer.updateDirect(name, Math.round(distance), model, true);
        }

        if (entity.object3D.visible) {
            entity.setAttribute('scale', '1 1 1');
        } else {
            setTimeout(() => {
                if (entity.getAttribute('poi-renderer').active) {
                    entity.setAttribute('visible', true);
                    entity.setAttribute('scale', '1 1 1');
                }
            }, 100);
        }
    },

    deactivatePoolEntity: function (entity) {
        entity.setAttribute('poi-renderer', { active: false });
        entity.setAttribute('visible', false);
        entity.setAttribute('scale', '0 0 0');
        entity.setAttribute('position', '0 -10000 0');
        entity.removeAttribute('locar-entity-place');
    }
});
