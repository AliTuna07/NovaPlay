const sounds={

    break:new Audio("assets/break.mp3"),
    win:new Audio("assets/win.mp3")

};


function playSound(name){

    if(sounds[name]){
        sounds[name].play();
    }

}