const stations = [


   
{  
name:"Chill FM",
    file:"assets/sounds/chill.mp3"
},

{
    name:"Night Drive",
    file:"assets/sounds/night.mp3"
},

{
    name:"Synthwave",
    file:"assets/sounds/synthwave.mp3"
},

{
    name:"Highway Mix",
    file:"assets/sounds/highway.mp3"
},

{
    name:"Summer Beats",
    file:"assets/sounds/summer.mp3"
}

];
let current = 0;

const audio = new Audio();

audio.loop = true;

audio.volume = 0.6;

const stationName =
document.getElementById("stationName");

const playButton =
document.getElementById("playStation");

const volume =
document.getElementById("radioVolume");

function loadStation(){

audio.src = stations[current].file;

stationName.textContent =
stations[current].name;
playButton.textContent = "⏸";
audio.play().catch(console.error);
}

document
.getElementById("nextStation")
.onclick = ()=>{

current++;

if(current>=stations.length)
current=0;

loadStation();

};

document
.getElementById("prevStation")
.onclick = ()=>{

current--;

if(current<0)
current=stations.length-1;

loadStation();

};

playButton.onclick=()=>{

if(audio.paused){

audio.play();

playButton.textContent="⏸";

}else{

audio.pause();

playButton.textContent="▶";

}

};

volume.oninput=(e)=>{

audio.volume=e.target.value/100;

};

loadStation();