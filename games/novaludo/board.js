// =========================
// NovaPlay - NovaLudo
// board.js
// Bölüm 1 / 2
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID = 15;
const TILE = canvas.width / GRID;

// Hücre Tipleri
const CELL = {
    EMPTY: 0,
    PATH: 1,

    RED_HOME: 2,
    GREEN_HOME: 3,
    YELLOW_HOME: 4,
    BLUE_HOME: 5,

    RED_FINISH: 6,
    GREEN_FINISH: 7,
    YELLOW_FINISH: 8,
    BLUE_FINISH: 9,

    SAFE: 10,

    CENTER: 11
};

// Renkler
const COLORS = {

    [CELL.EMPTY]: "#f1f5f9",

    [CELL.PATH]: "#ffffff",

    [CELL.RED_HOME]: "#ef4444",

    [CELL.GREEN_HOME]: "#22c55e",

    [CELL.YELLOW_HOME]: "#facc15",

    [CELL.BLUE_HOME]: "#3b82f6",

    [CELL.RED_FINISH]: "#ff9d9d",

    [CELL.GREEN_FINISH]: "#9dffb0",

    [CELL.YELLOW_FINISH]: "#fff29d",

    [CELL.BLUE_FINISH]: "#9dc8ff",

    [CELL.SAFE]: "#ffd54a",

    [CELL.CENTER]: "#8b5cf6"

};

const board = Array.from(
    { length: GRID },
    () => Array(GRID).fill(CELL.EMPTY)
);

// 52 Karelik Ana Yol
const PATH = [

    {x:6,y:1},
    {x:6,y:2},
    {x:6,y:3},
    {x:6,y:4},
    {x:6,y:5},

    {x:5,y:6},
    {x:4,y:6},
    {x:3,y:6},
    {x:2,y:6},
    {x:1,y:6},
    {x:0,y:6},

    {x:0,y:7},

    {x:0,y:8},

    {x:1,y:8},
    {x:2,y:8},
    {x:3,y:8},
    {x:4,y:8},
    {x:5,y:8},

    {x:6,y:9},
    {x:6,y:10},
    {x:6,y:11},
    {x:6,y:12},
    {x:6,y:13},
    {x:6,y:14},

    {x:7,y:14},

    {x:8,y:14},

    {x:8,y:13},
    {x:8,y:12},
    {x:8,y:11},
    {x:8,y:10},
    {x:8,y:9},

    {x:9,y:8},
    {x:10,y:8},
    {x:11,y:8},
    {x:12,y:8},
    {x:13,y:8},
    {x:14,y:8},

    {x:14,y:7},

    {x:14,y:6},

    {x:13,y:6},
    {x:12,y:6},
    {x:11,y:6},
    {x:10,y:6},
    {x:9,y:6},

    {x:8,y:5},
    {x:8,y:4},
    {x:8,y:3},
    {x:8,y:2},
    {x:8,y:1},

    {x:8,y:0},

    {x:7,y:0},

    {x:6,y:0}

];

// Güvenli Kareler
const SAFE_INDEXES = [

    9,
    22,
    35,
    48

];

// Yol Kareleri
for (const tile of PATH) {

    board[tile.y][tile.x] = CELL.PATH;

}

// Güvenli Kareler
for (const i of SAFE_INDEXES) {

    const p = PATH[i];

    board[p.y][p.x] = CELL.SAFE;

}

// Evler
for(let y=0;y<6;y++){

    for(let x=0;x<6;x++){

        board[y][x]=CELL.RED_HOME;

        board[y][9+x]=CELL.GREEN_HOME;

        board[9+y][0+x]=CELL.BLUE_HOME;

        board[9+y][9+x]=CELL.YELLOW_HOME;

    }

}

// Kırmızı Ev Yolu
for(let x=1;x<=5;x++){

    board[7][x]=CELL.RED_FINISH;

}

// Yeşil Ev Yolu
for(let y=1;y<=5;y++){

    board[y][7]=CELL.GREEN_FINISH;

}
// Sarı Ev Yolu
for (let x = 13; x >= 9; x--) {
    board[7][x] = CELL.YELLOW_FINISH;
}

// Mavi Ev Yolu
for (let y = 13; y >= 9; y--) {
    board[y][7] = CELL.BLUE_FINISH;
}

// Merkez
board[7][7] = CELL.CENTER;

// Oyuncu başlangıç daireleri
const HOME_CIRCLES = {

    red: [
        { x: 2, y: 2 },
        { x: 4, y: 2 },
        { x: 2, y: 4 },
        { x: 4, y: 4 }
    ],

    green: [
        { x: 10, y: 2 },
        { x: 12, y: 2 },
        { x: 10, y: 4 },
        { x: 12, y: 4 }
    ],

    blue: [
        { x: 2, y: 10 },
        { x: 4, y: 10 },
        { x: 2, y: 12 },
        { x: 4, y: 12 }
    ],

    yellow: [
        { x: 10, y: 10 },
        { x: 12, y: 10 },
        { x: 10, y: 12 },
        { x: 12, y: 12 }
    ]

};

// Kare çiz
function drawTile(x, y, color) {

    const px = x * TILE;
    const py = y * TILE;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, TILE, TILE);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;

    ctx.strokeRect(px, py, TILE, TILE);

}

// Ev dairesi
function drawHomeCircle(x, y, color) {

    const px = x * TILE + TILE / 2;
    const py = y * TILE + TILE / 2;

    ctx.beginPath();
    ctx.arc(px, py, TILE * 0.32, 0, Math.PI * 2);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

}

// Güvenli kare yıldızı
function drawSafeStar(x, y) {

    const cx = x * TILE + TILE / 2;
    const cy = y * TILE + TILE / 2;

    ctx.fillStyle = "#f59e0b";
    ctx.font = `${TILE * 0.55}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("★", cx, cy + 1);

}

// Tahtayı çiz
function drawBoard() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kareler
    for (let y = 0; y < GRID; y++) {

        for (let x = 0; x < GRID; x++) {

            drawTile(
                x,
                y,
                COLORS[board[y][x]]
            );

        }

    }

    // Başlangıç daireleri
    for (const color in HOME_CIRCLES) {

        HOME_CIRCLES[color].forEach(pos => {

            drawHomeCircle(
                pos.x,
                pos.y,
                color
            );

        });

    }

    // Güvenli kareler
    SAFE_INDEXES.forEach(index => {

        const tile = PATH[index];

        drawSafeStar(
            tile.x,
            tile.y
        );

    });

    // Merkez hedef
    const cx = 7 * TILE;
    const cy = 7 * TILE;

    ctx.beginPath();

    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + TILE, cy);
    ctx.lineTo(cx + TILE / 2, cy + TILE / 2);
    ctx.closePath();

    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(cx + TILE, cy);
    ctx.lineTo(cx + TILE, cy + TILE);
    ctx.lineTo(cx + TILE / 2, cy + TILE / 2);
    ctx.closePath();

    ctx.fillStyle = "#facc15";
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(cx + TILE, cy + TILE);
    ctx.lineTo(cx, cy + TILE);
    ctx.lineTo(cx + TILE / 2, cy + TILE / 2);
    ctx.closePath();

    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(cx, cy + TILE);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + TILE / 2, cy + TILE / 2);
    ctx.closePath();

    ctx.fillStyle = "#ef4444";
    ctx.fill();

}