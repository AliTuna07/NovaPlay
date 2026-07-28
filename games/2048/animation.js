class AnimationManager {


    constructor(){

        this.speed = 150;

    }



    moveEffect(element, x, y){


        if(!element) return;


        element.style.transition =
        `transform ${this.speed}ms ease`;


        element.style.transform =
        `translate(${x}px, ${y}px)`;



        setTimeout(()=>{

            element.style.transform =
            "translate(0,0)";


        }, this.speed);


    }



    addAppearEffect(element){


        if(!element) return;


        element.style.transform =
        "scale(0)";


        setTimeout(()=>{

            element.style.transition =
            "transform 150ms ease";


            element.style.transform =
            "scale(1)";


        },10);


    }



    addMergeEffect(element){


        if(!element) return;


        element.style.transition =
        "transform 120ms ease";


        element.style.transform =
        "scale(1.15)";


        setTimeout(()=>{


            element.style.transform =
            "scale(1)";


        },120);


    }


}