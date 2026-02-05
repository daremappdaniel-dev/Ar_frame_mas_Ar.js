import * as THREE from 'three';
import { ArtoolkitPlugin } from '@ar-js-org/arjs-plugin-artoolkit';

const initAR = async () => {
    console.log('[DareMapp] Iniciando sistema AR con marcadores...');

    const eventBus = {
        _h: new Map(),
        on(e, h) {
            if (!this._h.has(e)) this._h.set(e, []);
            this._h.get(e).push(h);
        },
        emit(e, p) {
            (this._h.get(e) || []).forEach((fn) => {
                try { fn(p); } catch (err) { console.error(err); }
            });
        },
    };

    const engine = { eventBus };

    const plugin = new ArtoolkitPlugin({
        worker: true,
        minConfidence: 0.6
    });

    await plugin.init(engine);
    await plugin.enable();

    console.log('[DareMapp] Plugin ARToolKit habilitado. Version:', plugin.version);

    await plugin.loadMarker('./markers/hiro.patt', 1);
    console.log('[DareMapp] Marcador Hiro cargado');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.visible = false;
    scene.add(cube);

    camera.position.z = 2;

    eventBus.on('ar:markerFound', ({ id, poseMatrix }) => {
        console.log('[DareMapp] ¡Marcador detectado! ID:', id);
        cube.visible = true;
        document.body.style.border = '5px solid green';
    });

    eventBus.on('ar:markerUpdated', ({ id, poseMatrix }) => {
        const matrix = new THREE.Matrix4();
        matrix.fromArray(poseMatrix);
        cube.position.setFromMatrixPosition(matrix);
    });

    eventBus.on('ar:markerLost', ({ id }) => {
        console.log('[DareMapp] Marcador perdido');
        cube.visible = false;
        document.body.style.border = 'none';
    });

    const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    };

    animate();
    console.log('[DareMapp] Sistema AR listo. Apunta al marcador Hiro.');
};

window.addEventListener('DOMContentLoaded', initAR);
