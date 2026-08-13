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

// =====================================
// 🧱 / 🥩 ÖNİZLEME OLUŞTUR
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


    // =================================
    // 💡 IŞIK
    // =================================

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

    let object;
    // =================================
    // 🥩 ÇİĞ ET
    // =================================

   


    if (
        type === "raw_meat"
    ) {

        const meatMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x9b3028,

                roughness: 0.65,

                metalness: 0

            });


        const meatGeometry =
            new THREE.BoxGeometry(
                0.75,
                0.48,
                0.55
            );


        object =
            new THREE.Mesh(
                meatGeometry,
                meatMaterial
            );


        object.rotation.x =
            -0.25;

        object.rotation.y =
            0.55;


        // Yağ parçaları
        const fatMaterial =
            new THREE.MeshStandardMaterial({

                color: 0xf0d6a0,

                roughness: 0.7

            });


        const fatGeometry =
            new THREE.BoxGeometry(
                0.12,
                0.08,
                0.10
            );


        const fat1 =
            new THREE.Mesh(
                fatGeometry,
                fatMaterial
            );

        fat1.position.set(
            -0.18,
            0.20,
            0.18
        );

        object.add(
            fat1
        );


        const fat2 =
            new THREE.Mesh(
                fatGeometry,
                fatMaterial.clone()
            );

        fat2.position.set(
            0.20,
            0.12,
            -0.14
        );

        object.add(
            fat2
        );


        scene.add(
            object
        );

    }

    
// =================================
// ⚔️ KILIÇ
// =================================


else if (type === "sword") {

    const swordGroup =
        new THREE.Group();

    const blade =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.16,
                0.95,
                0.08
            ),
            new THREE.MeshStandardMaterial({
                color: 0xcfd6df,
                metalness: 0.75,
                roughness: 0.25
            })
        );

    blade.position.y = 0.48;

    swordGroup.add(blade);

    const handle =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.13,
                0.38,
                0.13
            ),
            new THREE.MeshStandardMaterial({
                color: 0x5a321c
            })
        );

    handle.position.y = -0.25;

    swordGroup.add(handle);

    const guard =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.48,
                0.09,
                0.11
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd5a72a
            })
        );

    guard.position.y = -0.02;

    swordGroup.add(guard);

    swordGroup.rotation.z = -0.8;

    swordGroup.scale.set(
        0.65,
        0.65,
        0.65
    );

    object = swordGroup;

    scene.add(object);

}
else if (type === "axe") {

    const axeGroup =
        new THREE.Group();

    const handle =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                0.9,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x5a321c

            })

        );

    handle.position.y = -0.1;

    axeGroup.add(handle);

    const blade =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.5,
                0.35,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x888888,

                metalness: 0.7

            })

        );

    blade.position.set(
        0.2,
        0.3,
        0
    );

    axeGroup.add(blade);

    axeGroup.rotation.z =
        -0.6;

    object =
        axeGroup;

    scene.add(
        object
    );

}
else if (type === "pickaxe") {

    const pickaxeGroup =
        new THREE.Group();

    // Sap

    const handle =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                0.9,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x5a321c

            })

        );

    handle.position.y = -0.1;

    pickaxeGroup.add(handle);

    // Kazma başlığı

    const head =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                0.18,
                0.18
            ),

            new THREE.MeshStandardMaterial({

                color: 0x888888,

                metalness: 0.6

            })

        );

    head.position.y = 0.4;

    pickaxeGroup.add(head);

    pickaxeGroup.rotation.z = -0.5;

    object = pickaxeGroup;

    scene.add(object);

}
else {

    const material =
        getMaterial(type);

    object =
        new THREE.Mesh(
            geometry,
            material
        );

    object.rotation.x = -0.35;
    object.rotation.y = 0.65;

    scene.add(object);

}


    const preview = {

        canvas,

        scene,

        camera,

        block: object,

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