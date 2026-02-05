import * as THREE from 'three';
import { ARjs } from '@ar-js-org/ar.js-next';
import { ARToolKitPlugin } from '@ar-js-org/arjs-plugin-artoolkit';
import { ThreejsPlugin } from '@ar-js-org/arjs-plugin-threejs';

window.onload = async () => {
    const arjs = new ARjs();

    const artoolkitPlugin = new ARToolKitPlugin({
        dpr: window.devicePixelRatio,
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
        cameraParametersUrl: './arjs-resources/camera_para.dat',
        wasmUrl: './arjs-resources/artoolkit_wasm.wasm',
    });

    const threejsPlugin = new ThreejsPlugin({
        renderer: {
            logarithmicDepthBuffer: true,
            precision: 'mediump'
        }
    });

    arjs.registerPlugin(artoolkitPlugin);
    arjs.registerPlugin(threejsPlugin);

    await arjs.init();

    const { scene, camera } = threejsPlugin;

    const anchor = artoolkitPlugin.addNFTAnchor('./markers/girona');

    const geometry = new THREE.PlaneGeometry(1, 1);
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./markers/girona.png');
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });

    const imageMesh = new THREE.Mesh(geometry, material);

    imageMesh.rotation.x = -Math.PI / 2;
    imageMesh.scale.set(150, 150, 150);

    anchor.add(imageMesh);
    scene.add(anchor);

    arjs.start();
    console.log("Sistema AR.js Next iniciado buscando 'girona'...");
};
