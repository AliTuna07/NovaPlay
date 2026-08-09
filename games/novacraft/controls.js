import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";


export function setupControls(camera, blocks){

    const keys = {};

    function setKeyState(e, value) {
        if (e.code) {
            keys[e.code] = value;
        }
        const normalized = String(e.key || "").toLowerCase();
        if (normalized === "w") keys["KeyW"] = value;
        if (normalized === "a") keys["KeyA"] = value;
        if (normalized === "s") keys["KeyS"] = value;
        if (normalized === "d") keys["KeyD"] = value;
    }

    document.addEventListener(
        "keydown",
        e => {
            if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            setKeyState(e, true);
        }
    );


    document.addEventListener(
        "keyup",
        e => {
            setKeyState(e, false);
        }
    );


    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

function checkCollision(position){

    const playerHeight = 2;
    const playerWidth = 0.35;


    const playerMinY = position.y - playerHeight;
    const playerMaxY = position.y;


    for(let block of blocks){

        const blockMinX = block.position.x - 0.5;
        const blockMaxX = block.position.x + 0.5;

        const blockMinY = block.position.y - 0.5;
        const blockMaxY = block.position.y + 0.5;

        const blockMinZ = block.position.z - 0.5;
        const blockMaxZ = block.position.z + 0.5;


        const hitX =
            position.x + playerWidth > blockMinX &&
            position.x - playerWidth < blockMaxX;


        const hitZ =
            position.z + playerWidth > blockMinZ &&
            position.z - playerWidth < blockMaxZ;


        const hitY =
            playerMaxY > blockMinY &&
            playerMinY < blockMaxY;


        if(hitX && hitY && hitZ){

            return true;

        }

    }


    return false;

}
    function update(){

        const speed = 0.12;


        direction.set(0,0,0);


        camera.getWorldDirection(direction);

        direction.y = 0;

        direction.normalize();


        right.crossVectors(
            camera.up,
            direction
        ).normalize();



        let move = new THREE.Vector3();



        if(keys["KeyW"])
            move.add(direction);


        if(keys["KeyS"])
            move.sub(direction);


        if(keys["KeyA"])
            move.add(right);


        if(keys["KeyD"])
            move.sub(right);



        if(move.length()>0){

            move.normalize();

            let nextPosition =
                camera.position.clone()
                .addScaledVector(
                    move,
                    speed
                );


            

                if(!checkCollision(nextPosition)){

    camera.position.copy(nextPosition);

}

            

        }

    }


    return update;

}