// =========================
// NovaPlay Bomberman
// world.js
// =========================
let exitDoor = {
    x: -1,
    y: -1,
    revealed: false
};
const ROWS = 9;
const COLS = 13;

const EMPTY = 0;
const WALL = 1;
const BOX = 2;

const world = [];

function generateWorld() {

    world.length = 0;

    for (let y = 0; y < ROWS; y++) {

        world[y] = [];

        for (let x = 0; x < COLS; x++) {

            // Dış duvarlar
            if (
                x === 0 ||
                y === 0 ||
                x === COLS - 1 ||
                y === ROWS - 1
            ) {
                world[y][x] = WALL;
                continue;
            }

            // İç taş bloklar
            if (x % 2 === 0 && y % 2 === 0) {
                world[y][x] = WALL;
                continue;
            }

            // Başlangıç güvenli alanı
            if (
                (x === 1 && y === 1) ||
                (x === 2 && y === 1) ||
                (x === 1 && y === 2)
            ) {
                world[y][x] = EMPTY;
                continue;
            }

            // %70 kutu
            world[y][x] = Math.random() < 0.7
                ? BOX
                : EMPTY;

        }

    }
const boxes = [];

for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
        if (world[y][x] === BOX) {
            boxes.push({ x, y });
        }
    }
}

if (boxes.length > 0) {
    const randomBox = boxes[Math.floor(Math.random() * boxes.length)];

    exitDoor.x = randomBox.x;
    exitDoor.y = randomBox.y;
    exitDoor.revealed = false;
}
}

generateWorld();

function drawWorld() {

    for (let y = 0; y < ROWS; y++) {

        for (let x = 0; x < COLS; x++) {

            const tile = world[y][x];

            const px = x * TILE;
            const py = y * TILE;

            switch (tile) {

                case EMPTY:

                    ctx.fillStyle = "#2b9c4a";
                    ctx.fillRect(px, py, TILE, TILE);

                    break;

                case WALL:

                    ctx.fillStyle = "#5d6672";
                    ctx.fillRect(px, py, TILE, TILE);

                    ctx.fillStyle = "#798491";
                    ctx.fillRect(
                        px + 4,
                        py + 4,
                        TILE - 8,
                        TILE - 8
                    );

                    break;

                case BOX:

                    ctx.fillStyle = "#8b5a2b";
                    ctx.fillRect(px, py, TILE, TILE);

                    ctx.fillStyle = "#b57b42";
                    ctx.fillRect(
                        px + 6,
                        py + 6,
                        TILE - 12,
                        TILE - 12
                    );

                    ctx.strokeStyle = "#d7a15b";

                    ctx.beginPath();
                    ctx.moveTo(px + 10, py + 10);
                    ctx.lineTo(px + TILE - 10, py + TILE - 10);
                    ctx.moveTo(px + TILE - 10, py + 10);
                    ctx.lineTo(px + 10, py + TILE - 10);
                    ctx.stroke();

                    break;

            }

        }

    }
if (exitDoor.revealed) {

    const px = exitDoor.x * TILE;
    const py = exitDoor.y * TILE;

    ctx.fillStyle = "#3a1f0f";
    ctx.fillRect(px + 8, py + 8, TILE - 16, TILE - 16);

    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 4;
    ctx.strokeRect(px + 8, py + 8, TILE - 16, TILE - 16);

    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(px + TILE / 2, py + TILE / 2, 6, 0, Math.PI * 2);
    ctx.fill();
}
}

function isWalkable(x, y) {

    if (
        x < 0 ||
        y < 0 ||
        x >= COLS ||
        y >= ROWS
    ) {
        return false;
    }

    return world[y][x] === EMPTY;

}

function breakBox(x, y) {

    if (
        x < 0 ||
        y < 0 ||
        x >= COLS ||
        y >= ROWS
    ) return;


    if (world[y][x] === BOX) {

        world[y][x] = EMPTY;


        // Kapı kontrolü
        if (
            x === exitDoor.x &&
            y === exitDoor.y
        ) {
            exitDoor.revealed = true;
        }


        // Power-up şansı ayrı çalışır
        if(Math.random() < 0.35){

            powerUps.push({

                x,
                y,

                type: POWER_TYPES[
                    Math.floor(Math.random()*POWER_TYPES.length)
                ]

            });

        }

    }

}
function tileAtPixel(px, py) {

    return {

        x: Math.floor(px / TILE),

        y: Math.floor(py / TILE)

    };

}