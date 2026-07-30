function gameLoop(){

    drawBoard();

    drawPieces();

    requestAnimationFrame(gameLoop);

}

gameLoop();