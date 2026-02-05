import * as THREE from 'three';
import {
    Engine,
    CaptureSystem,
    SOURCE_TYPES,
    FramePumpSystem,
    webcamPlugin
} from '@ar-js-org/ar.js-next';
import { ARToolKitPlugin } from '@ar-js-org/arjs-plugin-artoolkit';
import { ThreejsPlugin } from '@ar-js-org/arjs-plugin-threejs';

const initAR = async () => {
    // 1. Core: Engine (ECS)
    const engine = new Engine();
    const ctx = engine.getContext();
    window.engine = engine; // Debug

    // 2. Plugins Registration
    console.log("[DareMapp] Registrando plugins...");

    // Webcam (Core)
    engine.pluginManager.register(webcamPlugin.id, webcamPlugin);

    // Detection (ARToolKit)
    const artoolkitPlugin = new ARToolKitPlugin({
        cameraParametersUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
        wasmUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/three.js/examples/vendor/artoolkit/artoolkit_wasm.wasm',
        detectionMode: 'mono',
        canvasWidth: 640,
        canvasHeight: 480
    });
    engine.pluginManager.register('artoolkit', artoolkitPlugin);

    // Render (ThreeJS)
    const threejsPlugin = new ThreejsPlugin({
        renderer: {
            logarithmicDepthBuffer: true,
            precision: 'mediump',
            alpha: true
        }
    });
    engine.pluginManager.register('threejs', threejsPlugin);

    // 3. Enabling Plugins
    await engine.pluginManager.enable(webcamPlugin.id, ctx);
    await engine.pluginManager.enable('artoolkit', ctx);
    await engine.pluginManager.enable('threejs', ctx);

    // 4. Capture System (Webcam)
    console.log("[DareMapp] Iniciando captura...");
    await CaptureSystem.initialize(
        { sourceType: SOURCE_TYPES.WEBCAM, sourceWidth: 640, sourceHeight: 480 },
        ctx
    );

    // 5. Scene & Anchor Setup (The Look)
    const { scene, camera } = threejsPlugin;

    // --- Anchor Pattern Implementation ---
    const createAnchor = (markerId) => {
        const anchor = new THREE.Group();
        anchor.matrixAutoUpdate = false;
        anchor.visible = false;
        scene.add(anchor);

        // Subscribe to Event Bus (Pub/Sub Pattern)
        const onMarkerFound = ({ id, poseMatrix }) => {
            if (id === markerId) {
                console.log(`🎯 Marcador detectado: ${id}`);
                anchor.visible = true;
                if (poseMatrix) anchor.matrix.fromArray(poseMatrix);
            }
        };

        const onMarkerUpdated = ({ id, poseMatrix }) => {
            if (id === markerId) {
                anchor.visible = true;
                if (poseMatrix) anchor.matrix.fromArray(poseMatrix);
            }
        };

        const onMarkerLost = ({ id }) => {
            if (id === markerId) {
                console.log(`💨 Marcador perdido: ${id}`);
                anchor.visible = false;
            }
        };

        engine.eventBus.on("ar:markerFound", onMarkerFound);
        engine.eventBus.on("ar:markerUpdated", onMarkerUpdated);
        engine.eventBus.on("ar:markerLost", onMarkerLost);

        return anchor;
    };

    // Create our specific Anchor for 'girona'
    // Note: '0' is usually the ID for the first loaded marker if loading sequential or single
    const gironaAnchor = createAnchor(0);

    // Add Content to Anchor
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.5, 0);
    mesh.scale.set(100, 100, 100); // Scaling up as requested in original
    gironaAnchor.add(mesh);

    // 6. Load Marker Data
    console.log("[DareMapp] Cargando marcadores...");
    // Assuming loadMarker handles NFT if the URL points to descriptors? 
    // If not, this is where it might fail if the plugin is strictly 'patt'. 
    // But we strictly follow the 'ar.js-next' pattern.
    // We try to load 'girona' which is a folder/prefix for NFT usually.
    // If this fails, we might need a specific NFT loading method (not documented in the basic README).
    try {
        const markerResult = await artoolkitPlugin.loadMarker('./markers/girona', 1);
        console.log("✅ Marcador cargado:", markerResult);
    } catch (e) {
        console.error("Error cargando marcador:", e);
    }

    // 7. Start Frame Pump & Engine
    console.log("[DareMapp] Arrancando motores...");
    FramePumpSystem.start(ctx);
    engine.start();

    // Visual Debug (Video)
    const { element: videoEl } = CaptureSystem.getFrameSource(ctx);
    videoEl.style.position = 'absolute';
    videoEl.style.top = '0';
    videoEl.style.left = '0';
    videoEl.style.zIndex = '-1';
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover';
    document.body.appendChild(videoEl);
};

window.addEventListener('DOMContentLoaded', initAR);
