class SoundManager {


    constructor() {

        this.enabled = true;


        this.sounds = {

            move: new Audio(
                "assets/sounds/move.mp3"
            ),


            merge: new Audio(
                "assets/sounds/merge.mp3"
            ),


            win: new Audio(
                "assets/sounds/win.mp3"
            )

        };

    }




    play(name) {


        if (!this.enabled) return;


        if (!this.sounds[name]) return;


        this.sounds[name].currentTime = 0;


        this.sounds[name].play()
        .catch(()=>{});


    }




    toggle() {


        this.enabled =
            !this.enabled;


        return this.enabled;


    }




    setEnabled(value) {


        this.enabled = value;


    }


}