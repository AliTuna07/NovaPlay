// =========================
// NovaPlay Bomberman
// levels.js
// =========================

let currentLevel = 1;

const levelData = [

    { enemies:4, time:180, reward:100 },

    { enemies:5, time:170, reward:120 },

    { enemies:6, time:165, reward:150 },

    { enemies:7, time:160, reward:180 },

    { enemies:8, time:150, reward:220 },

    { enemies:10,time:145,reward:300 },

    { enemies:12,time:140,reward:400 },

    { enemies:14,time:135,reward:500 }

];

function getLevel(){

    return levelData[
        Math.min(
            currentLevel-1,
            levelData.length-1
        )
    ];

}
const savedLevel =
Number(
localStorage.getItem(
"bombermanLevel"
));

if(savedLevel>0){

    currentLevel=savedLevel;

}