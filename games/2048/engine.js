class GameEngine {

    constructor(board) {

    this.board = board;

    this.score = 0;

    this.lastDirection = null;

    this.moves = [];
    this.lastMove = null;

}
getLastMove(){

    return this.lastMove;

}

    start() {

        this.board.reset();
        this.score = 0;

        this.board.addTile();
        this.board.addTile();

    }


   move(direction) {

    let oldBoard = this.board.clone();
    this.moves = [];

    let moved = false;
    this.lastDirection = direction;


    if (direction === "left") {

        moved = this.moveLeft();

    }

        else if (direction === "right") {

            this.rotateBoard();
            this.rotateBoard();

            moved = this.moveLeft();

            this.rotateBoard();
            this.rotateBoard();

        }

        else if (direction === "up") {

            this.rotateBoard();
            this.rotateBoard();
            this.rotateBoard();

            moved = this.moveLeft();

            this.rotateBoard();

        }

        else if (direction === "down") {

            this.rotateBoard();

            moved = this.moveLeft();

            this.rotateBoard();
            this.rotateBoard();
            this.rotateBoard();

        }

if(moved){

    this.lastMove = oldBoard;

    this.board.addTile();

}
        


        return moved;

    }



    moveLeft() {

        let moved = false;


        for (let row = 0; row < this.board.size; row++) {


    let original =
    [...this.board.cells[row]];


    let line =
    original.filter(value => value !== 0);


            for (let i = 0; i < line.length - 1; i++) {


                if (line[i] === line[i + 1]) {

                    line[i] *= 2;

                    this.score += line[i];

                    line.splice(i + 1, 1);

                }

            }


            while (line.length < this.board.size) {

                line.push(0);

            }


            if (
                JSON.stringify(this.board.cells[row]) 
                !== JSON.stringify(line)
            ) {

                moved = true;

            }

let oldPositions = [];

for(let col = 0; col < original.length; col++){

    if(original[col] !== 0){

        oldPositions.push({
            col: col,
            value: original[col]
        });

    }

}


let newCol = 0;


for(let i = 0; i < oldPositions.length; i++){


    let item =
    oldPositions[i];


    this.addMove(
        row,
        item.col,
        row,
        newCol,
        item.value
    );


    newCol++;


}
            this.board.cells[row] = line;

        }


        return moved;

    }



    rotateBoard() {

        let size = this.board.size;

        let newBoard = [];


        for (let col = 0; col < size; col++) {

            newBoard[col] = [];

            for (let row = size - 1; row >= 0; row--) {

                newBoard[col].push(
                    this.board.cells[row][col]
                );

            }

        }


        this.board.cells = newBoard;

    }



    isGameOver() {


        if (this.board.getEmptyCells().length > 0) {

            return false;

        }


        for (let row = 0; row < this.board.size; row++) {

            for (let col = 0; col < this.board.size; col++) {


                let current =
                    this.board.get(row, col);


                if (
                    col < this.board.size - 1 &&
                    current === this.board.get(row, col + 1)
                ) {

                    return false;

                }


                if (
                    row < this.board.size - 1 &&
                    current === this.board.get(row + 1, col)
                ) {

                    return false;

                }


            }

        }


        return true;

    }
getLastDirection(){

    return this.lastDirection;

}
addMove(fromRow, fromCol, toRow, toCol, value){

    this.moves.push({

        from:{
            row: fromRow,
            col: fromCol
        },

        to:{
            row: toRow,
            col: toCol
        },

        value:value

    });

}
getMoves(){

    return this.moves;

}
}