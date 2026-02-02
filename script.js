
AFRAME.registerComponent("gps-projected-entity-place", {
  _cameraGps: null,
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
  remove: function () {
    window.removeEventListener(
      "gps-camera-update-position",
      this.updatePositionListener,
    );
  },
  init: function () {
    this.coordSetListener = () => {
      if (!this._cameraGps) {
        var camera = document.querySelector("[gps-projected-camera]");
        if (!camera.components["gps-projected-camera"]) {
          console.error("gps-projected-camera not initialized");
          return;
        }
        this._cameraGps = camera.components["gps-projected-camera"];
        this._updatePosition();
      }
    };

    this.updatePositionListener = (ev) => {
      if (!this.data || !this._cameraGps) {
        return;
      }

      var dstCoords = this.el.getAttribute("position");
      var distanceForMsg = this._cameraGps.computeDistanceMeters(dstCoords);

      this.el.setAttribute("distance", distanceForMsg);
      this.el.setAttribute("distanceMsg", this._formatDistance(distanceForMsg));

      this.el.dispatchEvent(
        new CustomEvent("gps-entity-place-update-position", {
          detail: { distance: distanceForMsg },
        }),
      );

      var actualDistance = this._cameraGps.computeDistanceMeters(
        dstCoords,
        true,
      );

      if (actualDistance === Number.MAX_SAFE_INTEGER) {
        this.hideForMinDistance(this.el, true);
      } else {
        this.hideForMinDistance(this.el, false);
      }
    };

    window.addEventListener(
      "gps-camera-origin-coord-set",
      this.coordSetListener,
    );
    window.addEventListener(
      "gps-camera-update-position",
      this.updatePositionListener,
    );

    this._positionXDebug = 0;

    window.dispatchEvent(
      new CustomEvent("gps-entity-place-added", {
        detail: { component: this.el },
      }),
    );
  },

  hideForMinDistance: function (el, hideEntity) {
    if (hideEntity) {
      el.setAttribute("visible", "false");
    } else {
      el.setAttribute("visible", "true");
    }
  },

  _updatePosition: function () {
    var worldPos = this._cameraGps.latLonToWorld(
      this.data.latitude,
      this.data.longitude,
    );
    var position = this.el.getAttribute("position");

    this.el.setAttribute("position", {
      x: worldPos[0],
      y: position.y,
      z: worldPos[1],
    });
  },

  _formatDistance: function (distance) {
    distance = distance.toFixed(0);
    if (distance >= 1000) {
      return distance / 1000 + " kilometers";
    }
    return distance + " meters";
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
        latitude: 40.65416079190461,
        longitude: -4.696458373056158,
        model: "./assets/daremapp/daremapp_logo.glb",
        scale: "15 15 15",
        rotation: "0 0 0"
    };

    const scene = document.querySelector('a-scene');

    const entity = document.createElement('a-entity');
    entity.setAttribute('id', 'daremapp-logo');
    entity.setAttribute('gltf-model', place.model);

    entity.setAttribute('gps-projected-entity-place', {
        latitude: place.latitude,
        longitude: place.longitude
    });

    entity.setAttribute('scale', place.scale);
    entity.setAttribute('rotation', place.rotation);
    entity.setAttribute('look-at', '[gps-projected-camera]'); 

    scene.appendChild(entity);
}