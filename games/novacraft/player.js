export const player = {
    velocityY: 0,
    onGround: false
};

export function updatePlayer(camera, blocks) {
    const gravity = 0.02;
    player.velocityY -= gravity;

    let nextY = camera.position.y + player.velocityY;
    player.onGround = false;

    for (let block of blocks) {
        const blockTop = block.position.y + 0.5;
        const playerBottom = nextY - 1.8;

        const insideX =
            camera.position.x > block.position.x - 0.5 &&
            camera.position.x < block.position.x + 0.5;

        const insideZ =
            camera.position.z > block.position.z - 0.5 &&
            camera.position.z < block.position.z + 0.5;

        if (
            insideX &&
            insideZ &&
            playerBottom <= blockTop &&
            playerBottom >= block.position.y - 0.5
        ) {
            nextY = blockTop + 1.8;
            player.velocityY = 0;
            player.onGround = true;
        }
    }

    camera.position.y = nextY;
}

export function jump() {
    if (player.onGround) {
        player.velocityY = 0.28;
    }
}
