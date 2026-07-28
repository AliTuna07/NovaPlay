class Board {

    constructor(size) {
        this.size = size;
        this.cells = [];
        this.reset();
    }


    reset() {
        this.cells = [];

        for (let row = 0; row < this.size; row++) {

            this.cells[row] = [];

            for (let col = 0; col < this.size; col++) {
                this.cells[row][col] = 0;
            }

        }
    }


    getEmptyCells() {

        let empty = [];

        for (let row = 0; row < this.size; row++) {

            for (let col = 0; col < this.size; col++) {

                if (this.cells[row][col] === 0) {

                    empty.push({
                        row: row,
                        col: col
                    });

                }

            }

        }

        return empty;
    }


    addTile(value = 2) {

        let empty = this.getEmptyCells();

        if (empty.length === 0) return false;


        let position =
            empty[Math.floor(Math.random() * empty.length)];


        this.cells[position.row][position.col] = value;

        return true;
    }


    get(row, col) {

        return this.cells[row][col];

    }


    set(row, col, value) {

        this.cells[row][col] = value;

    }


    clone() {

        return this.cells.map(row => [...row]);

    }


}