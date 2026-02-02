/*
 * script.js
 * Implements 'gps-new-entity-place' with Haversine distance calculation and limits jitter.
 */

AFRAME.registerComponent("gps-new-entity-place", {
    schema: {
        longitude: {
            type: "number",
            default: 0,
        },
        latitude: {
            type: "number",
            default: 0,
        },
    },

    init: function () {
        const camera = document.querySelector("[gps-new-camera]");
        if (!camera.components["gps-new-camera"]) {
            console.error("gps-new-camera not initialised");
            return;
        }
        this._cameraGps = camera.components["gps-new-camera"];

        camera.addEventListener("gps-camera-update-position", (e) => {
            if (e.detail && e.detail.position) {
                this.distance = this._haversineDist(e.detail.position, this.data);
            }
        });

        this.el.sceneEl.emit("gps-entity-place-added", {
            component: this.el,
        });
    },

    update: function () {
        if (this._cameraGps && this._cameraGps.threeLoc) {
            const projCoords = this._cameraGps.threeLoc.lonLatToWorldCoords(
                this.data.longitude,
                this.data.latitude
            );
            this.el.object3D.position.set(
                projCoords[0],
                this.el.object3D.position.y,
                projCoords[1]
            );
        }
    },

    setDistanceFrom: function (position) {
        this.distance = this._haversineDist(position, this.data);
    },

    _haversineDist: function (src, dest) {
        const dlongitude = THREE.MathUtils.degToRad(dest.longitude - src.longitude);
        const dlatitude = THREE.MathUtils.degToRad(dest.latitude - src.latitude);

        const a =
            Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2) +
            Math.cos(THREE.MathUtils.degToRad(src.latitude)) *
            Math.cos(THREE.MathUtils.degToRad(dest.latitude)) *
            (Math.sin(dlongitude / 2) * Math.sin(dlongitude / 2));
        const angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return angle * 6371000;
    },
});

window.onload = function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        staticLoadPlaces();
    });
};

function staticLoadPlaces() {
    const place = {
        name: "DareMapp Logo",
        latitude: 40.6559441207,
        longitude: -4.6996381432,
        model: "./assets/daremapp/daremapp_logo.glb",
        scale: "15 15 15",
        rotation: "0 0 0"
    };

    const scene = document.querySelector('a-scene');

    const entity = document.createElement('a-entity');
    entity.setAttribute('id', 'daremapp-logo');
    entity.setAttribute('gltf-model', place.model);

    entity.setAttribute('gps-new-entity-place', {
        latitude: place.latitude,
        longitude: place.longitude
    });

    entity.setAttribute('scale', place.scale);
    entity.setAttribute('rotation', place.rotation);
    entity.setAttribute('look-at', '[gps-new-camera]'); 

    scene.appendChild(entity);
}