let selectedWeather =
localStorage.getItem("weather") || "auto";

const buttons =
document.querySelectorAll(".weatherButton");

buttons.forEach(button=>{

    button.onclick = ()=>{

        buttons.forEach(b=>{

            b.classList.remove("selected");

        });

        button.classList.add("selected");

        selectedWeather =
        button.dataset.weather;

    };

    if(button.dataset.weather===selectedWeather){

        button.classList.add("selected");

    }

});

document.querySelector(".saveButton").onclick=()=>{

    localStorage.setItem(
        "weather",
        selectedWeather
    );

    alert("Ayarlar kaydedildi.");

};