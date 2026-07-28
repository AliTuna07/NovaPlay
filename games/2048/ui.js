class GameUI {


constructor(boardElement, scoreElement){


    this.boardElement = boardElement;

    this.scoreElement = scoreElement;


    this.animation =
    new AnimationManager();


    this.tiles = [];


    this.previousBoard = null;


    this.gameOverScreen =
    document.getElementById("gameOverScreen");


    this.finalScore =
    document.getElementById("finalScore");


    this.finalHighScore =
    document.getElementById("finalHighScore");


}



createBoard(size){


    this.boardElement.innerHTML = "";

    this.tiles = [];


    for(let row = 0; row < size; row++){


        this.tiles[row] = [];


        for(let col = 0; col < size; col++){


            let tile =
            document.createElement("div");


            tile.classList.add("tile");


            tile.dataset.row = row;

            tile.dataset.col = col;


            this.boardElement.appendChild(tile);


            this.tiles[row][col] = tile;


        }

    }


}




draw(board){



    if(this.tiles.length === 0){

        this.createBoard(
            board.size
        );

    }



    let old =
    this.previousBoard;



    if(old){

        this.animateTiles(
            old,
            board
        );

    }



    for(let row = 0; row < board.size; row++){


        for(let col = 0; col < board.size; col++){


            let tile =
            this.tiles[row][col];


            let value =
            board.get(row,col);



            tile.className =
            "tile";


            tile.textContent =
            "";



            if(value !== 0){


                tile.textContent =
                value;


                tile.classList.add(
                    "tile-" + value
                );


            }


        }

    }



    this.previousBoard =
    this.copyBoard(board);



}





animateTiles(oldBoard,newBoard){


    let size =
    this.getTileSize();



    for(let row = 0; row < newBoard.size; row++){


        for(let col = 0; col < newBoard.size; col++){



            let oldValue =
            oldBoard[row][col];



            let newValue =
            newBoard.get(row,col);



            if(
                oldValue !== 0 &&
                oldValue === newValue
            ){



                let oldPosition =
                this.findTile(
                    oldValue,
                    row,
                    col,
                    oldBoard
                );



                if(oldPosition){


                    let tile =
                    this.tiles[row][col];


                    let x =
                    (oldPosition.col - col)
                    * size;


                    let y =
                    (oldPosition.row - row)
                    * size;



                    tile.style.transition =
                    "none";


                    tile.style.transform =
                    `translate(${x}px,${y}px)`;



                    requestAnimationFrame(()=>{


                        tile.style.transition =
                        "transform 150ms ease";


                        tile.style.transform =
                        "translate(0,0)";


                    });


                }


            }


        }

    }


}





findTile(value,row,col,board){


    if(board[row] && board[row][col] === value){


        return {
            row:row,
            col:col
        };

    }


    return null;


}





copyBoard(board){


    let result = [];


    for(let row = 0; row < board.size; row++){


        result[row] = [];


        for(let col = 0; col < board.size; col++){


            result[row][col] =
            board.get(row,col);


        }

    }


    return result;


}





getTileSize(){


    return (
        this.boardElement.clientWidth /
        GAME_CONFIG.size
    );


}





updateScore(score){

    this.scoreElement.textContent =
    score;

}





showGameOver(score,highScore){


    this.finalScore.textContent =
    score;


    this.finalHighScore.textContent =
    highScore;


    this.gameOverScreen.style.display =
    "flex";


}





hideGameOver(){


    this.gameOverScreen.style.display =
    "none";


}


}