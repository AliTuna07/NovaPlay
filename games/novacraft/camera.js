export function setupCameraControl(camera){

    let rotX = 0;
    let rotY = 0;


    document.body.addEventListener(
        "click",
        ()=>{
            document.body.requestPointerLock();
        }
    );


    document.addEventListener(
        "mousemove",
        e=>{

            if(document.pointerLockElement){

                rotY -= e.movementX * 0.002;

                rotX -= e.movementY * 0.002;


                // yukarı aşağı sınırı

                rotX = Math.max(
                    -Math.PI / 2,
                    Math.min(
                        Math.PI / 2,
                        rotX
                    )
                );


                camera.rotation.order = "YXZ";


                camera.rotation.y = rotY;

                camera.rotation.x = rotX;

            }

        }
    );

}