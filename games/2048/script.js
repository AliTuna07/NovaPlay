const boardElement =
document.getElementById("board");


const scoreElement =
document.getElementById("score");



const board =
new Board(GAME_CONFIG.size);



const engine =
new GameEngine(board);


window.gameEngine = engine;


const ui =
new GameUI(
    boardElement,
    scoreElement
);



const storage =
new StorageManager(
    GAME_CONFIG.storageKey
);



const achievements =
new AchievementManager();



const leaderboard =
new LeaderboardManager();



const sound =
new SoundManager();



const themes =
new ThemeManager();



const effects =
new EffectsManager();



function updateGame(){

    ui.draw(board);

    ui.updateScore(
        engine.score
    );


    storage.saveHighScore(
        engine.score
    );


    achievements.check(
        engine.score,
        board
    );


    if(engine.isGameOver()){

    ui.showGameOver(
        engine.score,
        storage.getHighScore()
    );

}

}



function startGame(){

    themes.apply(
        themes.getCurrent()
    );
    ui.hideGameOver();


    engine.start();


    updateGame();

}



function restartGame(){

    startGame();

}



const input =
new InputManager(
    engine,
    updateGame
);



startGame();