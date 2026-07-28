class InputManager {

    constructor(engine, updateCallback) {

        this.engine = engine;
        this.updateCallback = updateCallback;

        this.startX = 0;
        this.startY = 0;

        this.bindKeyboard();
        this.bindTouch();

    }



    move(direction) {

        let moved = this.engine.move(direction);


        if (moved) {

            this.updateCallback();

        }

    }



    bindKeyboard() {


        document.addEventListener(
            "keydown",
            (event) => {


                switch(event.key) {


                    case "ArrowLeft":

                        this.move("left");
                        break;


                    case "ArrowRight":

                        this.move("right");
                        break;


                    case "ArrowUp":

                        this.move("up");
                        break;


                    case "ArrowDown":

                        this.move("down");
                        break;


                }


            }

        );


    }



    bindTouch() {


        document.addEventListener(
            "touchstart",
            (event)=>{


                const touch = event.touches[0];

                this.startX = touch.clientX;
                this.startY = touch.clientY;


            }

        );



        document.addEventListener(
            "touchend",
            (event)=>{


                const touch = event.changedTouches[0];


                let endX = touch.clientX;
                let endY = touch.clientY;


                let diffX = endX - this.startX;
                let diffY = endY - this.startY;



                const minSwipe = 30;



                if (
                    Math.abs(diffX) > Math.abs(diffY)
                ) {


                    if (diffX > minSwipe) {

                        this.move("right");

                    }


                    else if (diffX < -minSwipe) {

                        this.move("left");

                    }


                }


                else {


                    if (diffY > minSwipe) {

                        this.move("down");

                    }


                    else if (diffY < -minSwipe) {

                        this.move("up");

                    }


                }


            }

        );


    }


}