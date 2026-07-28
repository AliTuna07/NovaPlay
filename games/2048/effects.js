class EffectsManager {


    constructor() {

        this.container =
            document.body;

    }



    createConfetti() {


        for (let i = 0; i < 80; i++) {


            let piece =
                document.createElement("div");


            piece.classList.add(
                "confetti"
            );


            piece.style.left =
                Math.random() * 100 + "vw";


            piece.style.top =
                "-20px";


            piece.style.animationDuration =
                (Math.random() * 2 + 1)
                + "s";


            piece.style.transform =
                `rotate(${Math.random()*360}deg)`;


            this.container.appendChild(
                piece
            );



            setTimeout(()=>{


                piece.remove();


            },3000);



        }


    }




    winEffect() {


        this.createConfetti();


        alert(
            "🎉 Tebrikler! 2048'e ulaştın!"
        );


    }




    achievementEffect() {


        this.createConfetti();


    }



}