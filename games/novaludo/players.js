// =========================
// NovaPlay - NovaLudo
// players.js
// =========================

const PLAYERS = [

{

    name:"Kırmızı",

    color:"#ef4444",

    startIndex:0,

    finishIndex:50,

    pieces:[]

},

{

    name:"Yeşil",

    color:"#22c55e",

    startIndex:13,

    finishIndex:11,

    pieces:[]

},

{

    name:"Sarı",

    color:"#facc15",

    startIndex:26,

    finishIndex:24,

    pieces:[]

},

{

    name:"Mavi",

    color:"#3b82f6",

    startIndex:39,

    finishIndex:37,

    pieces:[]

}

];

let currentPlayer=0;
function createPieces(){

    PLAYERS.forEach(player=>{

        player.pieces=[];

        for(let i=0;i<4;i++){

            player.pieces.push({

                home:true,

                finished:false,

                step:-1

            });

        }

    });

}
function getPiecePosition(player,piece){

    if(piece.home){

        return HOME_CIRCLES[
            player.name.toLowerCase()
        ][
            player.pieces.indexOf(piece)
        ];

    }

    const index=
    (player.startIndex+piece.step)%PATH.length;

    return PATH[index];

}
function drawPieces(){

    PLAYERS.forEach(player=>{

        player.pieces.forEach(piece=>{

            const pos=
            getPiecePosition(player,piece);

            const px=
            pos.x*TILE+TILE/2;

            const py=
            pos.y*TILE+TILE/2;

            ctx.beginPath();

            ctx.arc(
                px,
                py,
                TILE*0.28,
                0,
                Math.PI*2
            );

            ctx.fillStyle=player.color;

            ctx.fill();

            ctx.strokeStyle="white";

            ctx.lineWidth=3;

            ctx.stroke();

        });

    });

}
createPieces();