import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export const blocks = [];

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4caf50
});

const dirtMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b
});

export function createBlock(scene, x, y, z, material = grassMaterial) {

    const block = new THREE.Mesh(blockGeometry, material);

    block.position.set(x, y, z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);

    blocks.push(block);

    return block;
}

export function createWorld(scene) {

    // Zemin
    for (let x = -10; x <= 10; x++) {

        for (let z = -10; z <= 10; z++) {

            createBlock(
                scene,
                x,
                -0.5,
                z,
                grassMaterial
            );

        }
    }

    // Birkaç yükselti
    for (let x = -4; x <= 4; x++) {

        createBlock(
            scene,
            x,
            0.5,
            -5,
            dirtMaterial
        );

    }
}