import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import {
    spawnCowsInChunk,
    removeCowsFromChunk
} from "./animals.js";

// =====================================
// BLOKLAR
// =====================================

export const blocks = [];


// =====================================
// CHUNK AYARLARI
// =====================================

export const CHUNK_SIZE = 16;

// Oyuncunun etrafında kaç chunk yüklenecek
const LOAD_RADIUS = 1;

const loadedChunks = new Map();

let worldScene = null;


// =====================================
// GEOMETRİ
// =====================================

const blockGeometry =
    new THREE.BoxGeometry(1, 1, 1);


// =====================================
// MATERYALLER
// =====================================

// =====================================
// BLOK MATERYALLERİ
// =====================================

// ÇİM
const grassTopMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x55b83e
    });

const grassSideMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x6f9f32
    });

const grassBottomMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8b5a2b
    });


// DIŞARIDAN ERİŞİM
export const grassMaterial = [
    grassSideMaterial,
    grassSideMaterial,
    grassTopMaterial,
    grassBottomMaterial,
    grassSideMaterial,
    grassSideMaterial
];


// TOPRAK
export const dirtMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8b5a2b
    });


// TAŞ
export const stoneMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.9
    });


// ODUN
const woodSideMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8a5a32
    });

const woodTopMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb47a45
    });

export const woodMaterial = [
    woodSideMaterial,
    woodSideMaterial,
    woodTopMaterial,
    woodTopMaterial,
    woodSideMaterial,
    woodSideMaterial
];


// YAPRAK
export const leavesMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x2f8f3a,
        transparent: true,
        opacity: 0.88,
        roughness: 0.8
    });


// KUM
export const sandMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xd9c27a,
        roughness: 1
    });
    // =====================================
// 🌊 SU MATERYALİ
// =====================================

export const waterMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x2389da,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0
    });


// =====================================
// 🌊 OKYANUS AYARLARI
// =====================================

const WATER_LEVEL = 2;

// Okyanusların büyüklüğü
const OCEAN_SCALE = 0.035;

// Dünya tohumu
const OCEAN_SEED = 73421;


// =====================================
// 🌊 BASİT DETERMINISTIC NOISE
// =====================================

function oceanNoise(x, z) {

    const value =
        Math.sin(
            x * OCEAN_SCALE +
            OCEAN_SEED
        ) *
        Math.cos(
            z * OCEAN_SCALE -
            OCEAN_SEED
        );

    return value;
}


// =====================================
// 🌊 OKYANUS MU?
// =====================================

function isOcean(x, z) {

    const noise =
        oceanNoise(x, z);

    return noise > 0.58;
}


// =====================================
// 🏖️ OKYANUSA YAKIN MI?
// =====================================

function isNearOcean(x, z) {

    for (let dx = -2; dx <= 2; dx++) {

        for (let dz = -2; dz <= 2; dz++) {

            if (
                isOcean(
                    x + dx,
                    z + dz
                )
            ) {
                return true;
            }

        }

    }

    return false;
}
// =====================================
// YÜKSEKLİK
// =====================================

function getHeight(x, z) {

    const wave1 =
        Math.sin(x * 0.15) * 2;

    const wave2 =
        Math.cos(z * 0.18) * 2;

    const wave3 =
        Math.sin((x + z) * 0.08) * 2;

    return Math.max(
        1,
        Math.floor(
            3 +
            wave1 +
            wave2 +
            wave3
        )
    );
}


// =====================================
// BLOK OLUŞTUR
// =====================================

export function createBlock(
    scene,
    x,
    y,
    z,
    material = grassMaterial
) {

    const block =
        new THREE.Mesh(
            blockGeometry,
            material
        );

    block.position.set(
        x,
        y,
        z
    );

    block.castShadow = false;

    block.receiveShadow = true;

    scene.add(
        block
    );

    blocks.push(
        block
    );

    return block;
}
// =====================================
// BLOK SİL
// =====================================

export function removeBlock(
    scene,
    block
) {

    const index =
        blocks.indexOf(block);

    if (index !== -1) {
        blocks.splice(index, 1);
    }

    scene.remove(block);

}
// =====================================
// CHUNK ANAHTARI
// =====================================

function getChunkKey(
    chunkX,
    chunkZ
) {

    return `${chunkX},${chunkZ}`;

}


// =====================================
// CHUNK KOORDİNATI
// =====================================

function worldToChunk(value) {

    return Math.floor(
        value / CHUNK_SIZE
    );

}


// =====================================
// AĞAÇ
// =====================================

function createTree(
    scene,
    x,
    y,
    z,
    chunkBlocks
) {

    function addTreeBlock(
        bx,
        by,
        bz,
        material
    ) {

        const block =
            createBlock(
                scene,
                bx,
                by,
                bz,
                material
            );

        chunkBlocks.push(block);
    }


    // Gövde
    for (let i = 0; i < 4; i++) {

        addTreeBlock(
            x,
            y + i,
            z,
            woodMaterial
        );

    }


    // Yapraklar
    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            for (
                let dy = 2;
                dy <= 4;
                dy++
            ) {

                if (
                    Math.abs(dx) +
                    Math.abs(dz) <= 3
                ) {

                    addTreeBlock(
                        x + dx,
                        y + dy,
                        z + dz,
                        leavesMaterial
                    );

                }

            }

        }

    }


    addTreeBlock(
        x,
        y + 5,
        z,
        leavesMaterial
    );

}


// =====================================
// 🌍 CHUNK OLUŞTUR
// =====================================

function loadChunk(
    chunkX,
    chunkZ
) {

    const key =
        getChunkKey(
            chunkX,
            chunkZ
        );


    if (
        loadedChunks.has(key)
    ) {
        return;
    }


    const chunkBlocks = [];


    const startX =
        chunkX * CHUNK_SIZE;

    const startZ =
        chunkZ * CHUNK_SIZE;


    const endX =
        startX + CHUNK_SIZE - 1;

    const endZ =
        startZ + CHUNK_SIZE - 1;


    for (
        let x = startX;
        x <= endX;
        x++
    ) {

        for (
            let z = startZ;
            z <= endZ;
            z++
        ) {

            // =====================================
            // 🌍 ARAZİ BİLGİSİ
            // =====================================

            const height =
                getHeight(x, z);

            const ocean =
                isOcean(x, z);

            const nearOcean =
                isNearOcean(x, z);


            // =====================================
            // 🌊 OKYANUS
            // =====================================

            if (ocean) {

                const oceanFloor = -1;


                // Taş
                for (
                    let y = -3;
                    y < oceanFloor - 2;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            stoneMaterial
                        );

                    chunkBlocks.push(block);

                }


                // Toprak
                for (
                    let y = oceanFloor - 2;
                    y < oceanFloor;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            dirtMaterial
                        );

                    chunkBlocks.push(block);

                }


                // 🏖️ Kum deniz tabanı
                const sand =
                    createBlock(
                        worldScene,
                        x,
                        oceanFloor,
                        z,
                        sandMaterial
                    );

                chunkBlocks.push(sand);


                // 🌊 Su
                for (
                    let y = oceanFloor + 1;
                    y <= WATER_LEVEL;
                    y++
                ) {

                    const water =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            waterMaterial
                        );
                        water.userData.isWater = true;

                    chunkBlocks.push(water);

                }

            }


            // =====================================
            // 🏖️ OKYANUS KIYISI
            // =====================================

            else if (nearOcean) {

                // Taş
                for (
                    let y = -3;
                    y < height - 2;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            stoneMaterial
                        );

                    chunkBlocks.push(block);

                }


                // Toprak
                for (
                    let y = height - 2;
                    y < height;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            dirtMaterial
                        );

                    chunkBlocks.push(block);

                }


                // 🏖️ Kum yüzeyi
                const sand =
                    createBlock(
                        worldScene,
                        x,
                        height,
                        z,
                        sandMaterial
                    );

                chunkBlocks.push(sand);

            }


            // =====================================
            // 🌱 NORMAL ARAZİ
            // =====================================

            else {

                // Taş
                for (
                    let y = -3;
                    y < height - 2;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            stoneMaterial
                        );

                    chunkBlocks.push(block);

                }


                // Toprak
                for (
                    let y = height - 2;
                    y < height;
                    y++
                ) {

                    const block =
                        createBlock(
                            worldScene,
                            x,
                            y,
                            z,
                            dirtMaterial
                        );

                    chunkBlocks.push(block);

                }


                // Çim
                const grass =
                    createBlock(
                        worldScene,
                        x,
                        height,
                        z,
                        grassMaterial
                    );

                chunkBlocks.push(grass);


                // 🌳 Ağaç
                if (
                    x % 11 === 0 &&
                    z % 13 === 0 &&
                    Math.abs(x) > 4 &&
                    Math.abs(z) > 4
                ) {

                    createTree(
                        worldScene,
                        x,
                        height + 1,
                        z,
                        chunkBlocks
                    );

                }

            }

        }

    }


    // =====================================
    // 💾 CHUNK KAYDET
    // =====================================

    loadedChunks.set(
        key,
        chunkBlocks
    );
// =====================================
// 🐄 CHUNK HAYVANLARI
// =====================================

spawnCowsInChunk(
    worldScene,
    chunkX,
    chunkZ
);


}
// =====================================
// CHUNK SİL
// =====================================

function unloadChunk(
    chunkX,
    chunkZ
) {

    const key =
        getChunkKey(
            chunkX,
            chunkZ
        );


    const chunk =
        loadedChunks.get(key);


    if (!chunk) {
        return;
    }


    for (const block of chunk) {

        const index =
            blocks.indexOf(block);

        if (index !== -1) {
            blocks.splice(index, 1);
        }

        worldScene.remove(block);

    }

// =====================================
// 🐄 CHUNK HAYVANLARINI SİL
// =====================================

removeCowsFromChunk(
    chunkX,
    chunkZ,
    CHUNK_SIZE
);
    loadedChunks.delete(key);

}


// =====================================
// GEREKLİ CHUNKLARI YÜKLE
// =====================================

function updateChunks(
    playerX,
    playerZ
) {

    const centerX =
        worldToChunk(playerX);

    const centerZ =
        worldToChunk(playerZ);


    // Yakındaki chunklar
    for (
        let dx = -LOAD_RADIUS;
        dx <= LOAD_RADIUS;
        dx++
    ) {

        for (
            let dz = -LOAD_RADIUS;
            dz <= LOAD_RADIUS;
            dz++
        ) {

            loadChunk(
                centerX + dx,
                centerZ + dz
            );

        }

    }


    // Uzak chunkları sil
    for (
        const key of loadedChunks.keys()
    ) {

        const [cx, cz] =
            key.split(",").map(Number);


        if (
            Math.abs(cx - centerX) >
            LOAD_RADIUS ||

            Math.abs(cz - centerZ) >
            LOAD_RADIUS
        ) {

            unloadChunk(
                cx,
                cz
            );

        }

    }

}


// =====================================
// DÜNYAYI BAŞLAT
// =====================================

export function createWorld(scene) {

    worldScene = scene;


    // Başlangıçta merkez chunk
    // ve çevresini oluştur
    updateChunks(
        0,
        0
    );

}


// =====================================
// OYUNCU HAREKET ETTİKÇE DÜNYAYI GÜNCELLE
// =====================================

let lastChunkX = null;
let lastChunkZ = null;


export function updateWorld(
    playerX,
    playerZ
) {

    const chunkX =
        worldToChunk(playerX);

    const chunkZ =
        worldToChunk(playerZ);


    // Aynı chunk içindeysek
    // hiçbir şey yapma
    if (
        chunkX === lastChunkX &&
        chunkZ === lastChunkZ
    ) {

        return;

    }


    lastChunkX = chunkX;
    lastChunkZ = chunkZ;


    updateChunks(
        playerX,
        playerZ
    );

}