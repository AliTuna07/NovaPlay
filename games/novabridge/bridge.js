import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export const bridgeTiles = [];
export const safePath = [];

export function createBridge(scene){

    // Zemin yok, boşluk hissi
    scene.fog = new THREE.Fog(0x05070f, 18, 60);

    // Cam materyali
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x66ddff,
        transparent: true,
        opacity: 0.45,
        transmission: 1,
        roughness: 0,
        metalness: 0.1,
        thickness: 0.5
    });

    // Metal iskelet
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.3
    });

    // Başlangıç platformu
    const start = new THREE.Mesh(
        new THREE.BoxGeometry(6,0.5,4),
        frameMaterial
    );

    start.position.set(0,-0.25,2);

    scene.add(start);

    // Camlar
    for(let row=0; row<15; row++){

        bridgeTiles[row] = [];

        safePath[row] = Math.floor(Math.random()*2);

        for(let side=0; side<2; side++){

            const group = new THREE.Group();

            // Çerçeve
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(2.15,0.15,2.15),
                frameMaterial
            );

            // Cam
            const glass = new THREE.Mesh(
                new THREE.BoxGeometry(2,0.08,2),
                glassMaterial.clone()
            );

            glass.position.y = 0.05;

            group.add(frame);
            group.add(glass);

            group.position.set(
                side===0 ? -1.3 : 1.3,
                0,
                -row*2
            );

            scene.add(group);

            bridgeTiles[row][side] = group;

        }

    }

    // Bitiş platformu
    const finish = new THREE.Mesh(
        new THREE.BoxGeometry(6,0.5,4),
        frameMaterial
    );

    finish.position.set(0,-0.25,-30);

    scene.add(finish);

}
export function isSafe(row, side){

    if(row < 0 || row >= safePath.length){
        return true;
    }

    return safePath[row] === side;

}
export function breakGlass(row, side){

    console.log("Cam kırılıyor:", row, side);

    const tile = bridgeTiles[row][side];

    if(!tile) return;

    tile.userData.breaking = true;

}
export function updateBridge(){

    for(const row of bridgeTiles){

        if(!row) continue;
        if(row >= 15){

    winGame();

}

        for(const tile of row){

            if(!tile) continue;

            if(tile.userData.breaking){

                tile.rotation.x += 0.08;
                tile.position.y -= 0.06;

            }

        }

    }

}
function winGame(){

    const currentXP =
        Number(localStorage.getItem("novaXP")) || 0;

    const currentCoins =
        Number(localStorage.getItem("novaCoins")) || 0;

    localStorage.setItem(
        "novaXP",
        currentXP + 2000
    );

    localStorage.setItem(
        "novaCoins",
        currentCoins + 1000
    );

    alert("🏆 Kazandın!\n⭐ +2000 XP\n🪙 +1000 NovaCoin");

}