/* ==========================================
   NovaMines
   board.js
========================================== */

const BOARD_SIZE = 9;
const MINE_COUNT = 10;

let board = [];
let gameOver = false;
let firstClick = true;
let openedCells = 0;
let flagsPlaced = 0;

/* ------------------------------
   Hücre Sınıfı
------------------------------ */

class Cell {

    constructor(row, col) {

        this.row = row;
        this.col = col;

        this.mine = false;
        this.flag = false;

        this.open = false;

        this.number = 0;

        this.element = null;

    }

}

/* ------------------------------
   Tahta Oluştur
------------------------------ */

function createBoard() {

    board = [];
    openedCells = 0;
    flagsPlaced = 0;

    gameOver = false;
    firstClick = true;

    for (let r = 0; r < BOARD_SIZE; r++) {

        const row = [];

        for (let c = 0; c < BOARD_SIZE; c++) {

            row.push(new Cell(r, c));

        }

        board.push(row);

    }

}

/* ------------------------------
   Mayın Yerleştir
------------------------------ */

function placeMines(safeRow, safeCol) {

    let placed = 0;

    while (placed < MINE_COUNT) {

        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);

        if (board[r][c].mine)
            continue;

        // İlk tıklanan kareye mayın koyma
        if (r === safeRow && c === safeCol)
            continue;

        board[r][c].mine = true;
        placed++;

    }

    calculateNumbers();

}

/* ------------------------------
   Sayıları Hesapla
------------------------------ */

function calculateNumbers() {

    for (let r = 0; r < BOARD_SIZE; r++) {

        for (let c = 0; c < BOARD_SIZE; c++) {

            const cell = board[r][c];

            if (cell.mine)
                continue;

            let count = 0;

            for (let y = -1; y <= 1; y++) {

                for (let x = -1; x <= 1; x++) {

                    if (x === 0 && y === 0)
                        continue;

                    const nr = r + y;
                    const nc = c + x;

                    if (
                        nr < 0 ||
                        nr >= BOARD_SIZE ||
                        nc < 0 ||
                        nc >= BOARD_SIZE
                    )
                        continue;

                    if (board[nr][nc].mine)
                        count++;

                }

            }

            cell.number = count;

        }

    }

}

/* ------------------------------
   Hücreyi Getir
------------------------------ */

function getCell(row, col) {

    if (
        row < 0 ||
        row >= BOARD_SIZE ||
        col < 0 ||
        col >= BOARD_SIZE
    ) {

        return null;

    }

    return board[row][col];

}
/* ------------------------------
   Hücre Aç
------------------------------ */

function openCell(row, col) {

    if (gameOver) return;

    const cell = getCell(row, col);

    if (!cell) return;
    if (cell.open) return;
    if (cell.flag) return;

    // İlk tıklama
    if (firstClick) {

        placeMines(row, col);
        firstClick = false;

        if (typeof startTimer === "function") {
            startTimer();
        }

    }

    cell.open = true;
    openedCells++;
    playSound("click");

    if (cell.element) {

        cell.element.classList.add("open");

    }

    // Mayın
    if (cell.mine) {
        playSound("explosion");

        if (cell.element) {

            cell.element.classList.add("mine");
            cell.element.textContent = "💣";

        }

        revealAllMines();
        endGame(false);
        return;

    }

    // Sayı
    if (cell.number > 0) {

        if (cell.element) {

            cell.element.textContent = cell.number;

        }

    } else {

        // Boş alanları aç
        floodFill(row, col);

    }

    checkWin();

}

/* ------------------------------
   Flood Fill
------------------------------ */

function floodFill(row, col) {

    for (let y = -1; y <= 1; y++) {

        for (let x = -1; x <= 1; x++) {

            if (x === 0 && y === 0) continue;

            const next = getCell(row + y, col + x);

            if (!next) continue;
            if (next.open) continue;
            if (next.mine) continue;
            if (next.flag) continue;

            next.open = true;
            openedCells++;

            if (next.element) {

                next.element.classList.add("open");

            }

            if (next.number > 0) {

                if (next.element) {

                    next.element.textContent = next.number;

                }

            } else {

                floodFill(next.row, next.col);

            }

        }

    }

}

/* ------------------------------
   Bayrak
------------------------------ */

function toggleFlag(row, col) {

    if (gameOver) return;

    const cell = getCell(row, col);

    if (!cell) return;
    if (cell.open) return;

    cell.flag = !cell.flag;

    if (cell.flag) {

        flagsPlaced++;

        if (cell.element) {

            cell.element.classList.add("flag");
            cell.element.textContent = "🚩";

        }

    } else {

        flagsPlaced--;

        if (cell.element) {

            cell.element.classList.remove("flag");
            cell.element.textContent = "";

        }

    }

    if (typeof updateCounters === "function") {

        updateCounters();

    }

}

/* ------------------------------
   Mayınları Aç
------------------------------ */

function revealAllMines() {

    for (const row of board) {

        for (const cell of row) {

            if (!cell.mine) continue;

            if (cell.element) {

                cell.element.classList.add("mine");
                cell.element.textContent = "💣";

            }

        }

    }

}

/* ------------------------------
   Kazanma
------------------------------ */

function checkWin() {

    const safeCells = BOARD_SIZE * BOARD_SIZE - MINE_COUNT;

    if (openedCells !== safeCells) return;

    endGame(true);

}

/* ------------------------------
   Oyunu Bitir
------------------------------ */

function endGame(win) {

    gameOver = true;

    if (typeof stopTimer === "function") {

        stopTimer();

    }

    if (typeof showResult === "function") {

        showResult(win);

    }

    // NovaPlay ödülleri
    if (win) {

        if (typeof addXP === "function") {

            addXP(20);

        }

        if (typeof addCoins === "function") {

            addCoins(15);

        }

    }

}