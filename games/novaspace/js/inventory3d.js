import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    woodMaterial,
    leavesMaterial,
    sandMaterial
} from "./world.js";


// =====================================
// TEK RENDERER
// =====================================

let renderer = null;

const previews = new Map();

const geometry =
    new THREE.BoxGeometry(
        0.9,
        0.9,
        0.9
    );


// =====================================
// MATERYAL
// =====================================

function getMaterial(type) {

    if (type === "grass") {
        return grassMaterial;
    }

    if (type === "dirt") {
        return dirtMaterial;
    }

    if (type === "stone") {
        return stoneMaterial;
    }

    if (type === "wood") {
        return woodMaterial;
    }

    if (type === "leaves") {
        return leavesMaterial;
    }

    if (type === "sand") {
        return sandMaterial;
    }

    return stoneMaterial;
}


// =====================================
// TEK RENDERER OLUŞTUR
// =====================================

function getRenderer() {

    if (renderer) {
        return renderer;
    }

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    return renderer;
}


// =====================================
// BLOK ÖNİZLEME
// =====================================

function createPreview(
    element,
    type
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.className =
        "block-preview";

    element.appendChild(
        canvas
    );


    const width =
        element.clientWidth || 64;

    const height =
        element.clientHeight || 64;


    const scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x151923
        );


    const camera =
        new THREE.PerspectiveCamera(
            35,
            width / height,
            0.1,
            100
        );


    camera.position.set(
        1.8,
        1.5,
        2.4
    );


    camera.lookAt(
        0,
        0,
        0
    );


    const light =
        new THREE.AmbientLight(
            0xffffff,
            1.5
        );

    scene.add(
        light
    );


    const directional =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    directional.position.set(
        3,
        5,
        4
    );

    scene.add(
        directional
    );


    const material =
        getMaterial(type);


    const block =
        new THREE.Mesh(
            geometry,
            material
        );


    block.rotation.x =
        -0.35;

    block.rotation.y =
        0.65;


    scene.add(
        block
    );


    const preview = {

        canvas,
        scene,
        camera,
        block,
        width,
        height

    };


    previews.set(
        element,
        preview
    );


    renderPreview(
        preview
    );

}


// =====================================
// TEK RENDERER İLE ÇİZ
// =====================================

function renderPreview(
    preview
) {

    const {
        canvas,
        scene,
        camera,
        width,
        height
    } = preview;


    const activeRenderer =
        getRenderer();


    activeRenderer.setSize(
        width,
        height,
        false
    );


    activeRenderer.render(
        scene,
        camera
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.drawImage(
        activeRenderer.domElement,
        0,
        0
    );

}


// =====================================
// ENVANTERİ GÜNCELLE
// =====================================

export function update3DInventory(
    inventory
) {

    const slots =
        document.querySelectorAll(
            ".slot"
        );


    slots.forEach(
        (element, index) => {

            const data =
                inventory.slots[index];


            const old =
                previews.get(
                    element
                );


            if (old) {

                previews.delete(
                    element
                );

            }


            const oldCanvas =
                element.querySelector(
                    ".block-preview"
                );


            if (oldCanvas) {
                oldCanvas.remove();
            }


            if (!data) {
                return;
            }


            createPreview(
                element,
                data.type
            );

        }
    );

}