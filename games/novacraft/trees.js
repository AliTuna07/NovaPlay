import { createBlock } from "./blocks.js";


export function createTree(
    scene,
    blocks,
    x,
    y,
    z
){


    // gövde

    for(let i=0; i<4; i++){

        const trunk = createBlock(
            x,
            y+i,
            z,
            0x8b4513
        );

        scene.add(trunk);

    }



    // yapraklar

    for(let lx=-1; lx<=1; lx++){

        for(let lz=-1; lz<=1; lz++){

            for(let ly=3; ly<=4; ly++){


                const leaf = createBlock(
                    x+lx,
                    y+ly,
                    z+lz,
                    0x228b22
                );


                scene.add(leaf);


            }

        }

    }

}