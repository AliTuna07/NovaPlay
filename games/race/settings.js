/* ==========================================
   NovaRace Settings
   Garage System
========================================== */


const cars = [

{
    id:"basic",
    name:"Nova Basic",
    emoji:"🚗",
    price:0,
    speed:60,
    grip:70,
    accel:60
},

{
    id:"gt",
    name:"Nova GT",
    emoji:"🏎️",
    price:500,
    speed:85,
    grip:75,
    accel:80
},

{
    id:"racer",
    name:"Nova Racer",
    emoji:"🔥",
    price:1000,
    speed:100,
    grip:90,
    accel:95
}

];


let ownedCars =
JSON.parse(
localStorage.getItem("ownedCars")
)
||
["basic"];


let selectedCar =
localStorage.getItem("selectedCar")
||
"basic";


let currentIndex =
cars.findIndex(
car => car.id === selectedCar
);

if(currentIndex === -1){

    currentIndex = 0;

    localStorage.setItem(
        "selectedCar",
        "basic"
    );

}


const carPreview =
document.getElementById("carPreview");

const carName =
document.getElementById("carName");

const buyButton =
document.getElementById("buyButton");


const speedBar =
document.querySelector(".speed");

const gripBar =
document.querySelector(".grip");

const accelBar =
document.querySelector(".accel");



function updateGarage(){

    const car = cars[currentIndex];


    carPreview.innerHTML =
    car.emoji;


    carName.innerHTML =
    car.name;


    speedBar.style.width =
    car.speed + "%";


    gripBar.style.width =
    car.grip + "%";


    accelBar.style.width =
    car.accel + "%";


    if(
        ownedCars.includes(car.id)
    ){

        buyButton.innerHTML =
        "✅ Seç";

    }
    else{

        buyButton.innerHTML =
        "🪙 " + car.price;

    }

}



document
.getElementById("nextCar")
.onclick = () => {


    currentIndex++;


    if(currentIndex >= cars.length){

        currentIndex = 0;

    }


    updateGarage();

};



document
.getElementById("prevCar")
.onclick = () => {


    currentIndex--;


    if(currentIndex < 0){

        currentIndex =
        cars.length - 1;

    }


    updateGarage();

};




buyButton.onclick = () => {

    const car = cars[currentIndex];

    alert("Seçilen araba: " + car.name);


    if(ownedCars.includes(car.id)){

        selectedCar = car.id;

        localStorage.setItem(
            "selectedCar",
            selectedCar
        );

        alert(car.name + " seçildi 🚗");

        updateGarage();

        return;

    }


    let coins =
    Number(
        localStorage.getItem("novaCoins")
    )
    || 0;


    alert(
        "NovaCoin: " + coins +
        "\nGerekli: " + car.price
    );


    if(coins >= car.price){

        coins -= car.price;

        localStorage.setItem(
            "novaCoins",
            coins
        );


        ownedCars.push(car.id);

        localStorage.setItem(
            "ownedCars",
            JSON.stringify(ownedCars)
        );


        selectedCar = car.id;

        localStorage.setItem(
            "selectedCar",
            selectedCar
        );


        alert(car.name + " satın alındı ve seçildi 🏎️");

        updateGarage();


    }else{

        alert("Yeterli NovaCoin yok 💰");

    }

};


updateGarage();