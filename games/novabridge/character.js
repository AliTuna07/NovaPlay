import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

// ======================================
// KARAKTER RENKLERİ
// ======================================

const characterColors = [
    0x3498db,
    0xe74c3c,
    0x2ecc71,
    0xf1c40f,
    0x9b59b6,
    0xe67e22,
    0x1abc9c,
    0xec407a
];

// ======================================
// OYUNCU RENGİ
// ======================================

export function getPlayerColor(playerId) {

    let hash = 0;

    for (let i = 0; i < playerId.length; i++) {

        hash =
            playerId.charCodeAt(i) +
            ((hash << 5) - hash);

    }

    const index =
        Math.abs(hash) %
        characterColors.length;

    return characterColors[index];
}

// ======================================
// İSİM ETİKETİ
// ======================================

function createNameTag(name) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const context =
        canvas.getContext("2d");

    if (!context) {
        return null;
    }

    // Arka plan
    context.fillStyle =
        "rgba(0, 0, 0, 0.65)";

    context.beginPath();

    context.roundRect(
        10,
        15,
        492,
        98,
        20
    );

    context.fill();

    // Yazı
    context.font =
        "bold 52px Arial";

    context.textAlign =
        "center";

    context.textBaseline =
        "middle";

    context.fillStyle =
        "#ffffff";

    context.fillText(
        name || "Oyuncu",
        256,
        64
    );

    // Texture
    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.needsUpdate = true;

    // Material
    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });

    // Sprite
    const sprite =
        new THREE.Sprite(
            material
        );

    sprite.scale.set(
        2.4,
        0.6,
        1
    );

    sprite.position.y =
        2.5;

    return sprite;
}

// ======================================
// KARAKTER OLUŞTUR
// ======================================

export function createCharacter(
    playerId,
    playerName = "Oyuncu"
) {

    const character =
    new THREE.Group();

character.scale.set(
    0.65,
    0.65,
    0.65
);

character.position.y = 0;

    character.userData.playerId =
        playerId;

    character.userData.isMoving =
        false;

    character.userData.walkTime =
        0;

    // ==================================
    // İSİM
    // ==================================

    const nameTag =
        createNameTag(
            playerName
        );

    if (nameTag) {

        character.add(
            nameTag
        );

    }

    // ==================================
    // RENK
    // ==================================

    const color =
        getPlayerColor(
            playerId
        );

    // ==================================
    // MALZEMELER
    // ==================================

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color
        });

    const skinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffc49b
        });

    const darkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222
        });

    // ==================================
    // GÖVDE
    // ==================================

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                0.8,
                0.38
            ),
            bodyMaterial
        );

    body.position.y =
        1.05;

    character.add(
        body
    );

    // ==================================
    // KAFA
    // ==================================

    const head =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.52,
                0.52,
                0.52
            ),
            skinMaterial
        );

    head.position.y =
        1.72;

    character.add(
        head
    );

    // ==================================
    // SAÇ
    // ==================================

    const hair =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.18,
                0.55
            ),
            darkMaterial
        );

    hair.position.y =
        2.02;

    character.add(
        hair
    );

    // ==================================
    // GÖZLER
    // ==================================

    const eyeGeometry =
        new THREE.BoxGeometry(
            0.07,
            0.07,
            0.03
        );

    const leftEye =
        new THREE.Mesh(
            eyeGeometry,
            darkMaterial
        );

    leftEye.position.set(
        -0.13,
        1.78,
        -0.32
    );

    character.add(
        leftEye
    );

    const rightEye =
        new THREE.Mesh(
            eyeGeometry,
            darkMaterial
        );

    rightEye.position.set(
        0.13,
        1.78,
        -0.32
    );

    character.add(
        rightEye
    );

    // ==================================
    // KOLLAR
    // ==================================

    const armGeometry =
        new THREE.BoxGeometry(
            0.18,
            0.7,
            0.18
        );

    const leftArm =
        new THREE.Group();

    leftArm.position.set(
        -0.5,
        1.4,
        0
    );

    const leftArmMesh =
        new THREE.Mesh(
            armGeometry,
            bodyMaterial
        );

    leftArmMesh.position.y =
        -0.35;

    leftArm.add(
        leftArmMesh
    );

    character.add(
        leftArm
    );

    const rightArm =
        new THREE.Group();

    rightArm.position.set(
        0.5,
        1.4,
        0
    );

    const rightArmMesh =
        new THREE.Mesh(
            armGeometry,
            bodyMaterial
        );

    rightArmMesh.position.y =
        -0.35;

    rightArm.add(
        rightArmMesh
    );

    character.add(
        rightArm
    );

    // ==================================
    // BACAKLAR
    // ==================================

    const legGeometry =
        new THREE.BoxGeometry(
            0.22,
            0.7,
            0.22
        );

    const leftLeg =
        new THREE.Group();

    leftLeg.position.set(
        -0.2,
        0.75,
        0
    );

    const leftLegMesh =
        new THREE.Mesh(
            legGeometry,
            darkMaterial
        );

    leftLegMesh.position.y =
        -0.35;

    leftLeg.add(
        leftLegMesh
    );

    character.add(
        leftLeg
    );

    const rightLeg =
        new THREE.Group();

    rightLeg.position.set(
        0.2,
        0.75,
        0
    );

    const rightLegMesh =
        new THREE.Mesh(
            legGeometry,
            darkMaterial
        );

    rightLegMesh.position.y =
        -0.35;

    rightLeg.add(
        rightLegMesh
    );

    character.add(
        rightLeg
    );

    // ==================================
    // ANİMASYON REFERANSLARI
    // ==================================

    character.userData.leftArm =
        leftArm;

    character.userData.rightArm =
        rightArm;

    character.userData.leftLeg =
        leftLeg;

    character.userData.rightLeg =
        rightLeg;

    // ==================================
    // GERİ DÖNDÜR
    // ==================================

    return character;
}

// ======================================
// YÜRÜYÜŞ ANİMASYONU
// ======================================

export function updateCharacterAnimation(
    character,
    moving,
    delta = 0.016
) {

    if (!character) {
        return;
    }

    const leftArm =
        character.userData.leftArm;

    const rightArm =
        character.userData.rightArm;

    const leftLeg =
        character.userData.leftLeg;

    const rightLeg =
        character.userData.rightLeg;

    if (
        !leftArm ||
        !rightArm ||
        !leftLeg ||
        !rightLeg
    ) {

        return;

    }

    // ==================================
    // YÜRÜYOR
    // ==================================

    if (moving) {

        character.userData.walkTime +=
            delta * 9;

        const time =
            character.userData.walkTime;

        const swing =
            Math.sin(time) * 0.65;

        leftArm.rotation.x =
            swing;

        rightArm.rotation.x =
            -swing;

        leftLeg.rotation.x =
            -swing;

        rightLeg.rotation.x =
            swing;

        character.rotation.z =
            Math.sin(time * 2) *
            0.025;

    }

    // ==================================
    // DURUYOR
    // ==================================

    else {

        character.userData.walkTime =
            0;

        leftArm.rotation.x =
            0;

        rightArm.rotation.x =
            0;

        leftLeg.rotation.x =
            0;

        rightLeg.rotation.x =
            0;

        character.rotation.z =
            0;

    }

}