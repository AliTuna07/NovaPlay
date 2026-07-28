class AchievementManager {


    constructor() {

        this.key = "NovaPlay_2048_Achievements";

        this.achievements = {

            first128: {
                title: "🟦 İlk 128",
                unlocked: false
            },


            first512: {
                title: "🟪 İlk 512",
                unlocked: false
            },


            first1024: {
                title: "🟨 İlk 1024",
                unlocked: false
            },


            master2048: {
                title: "👑 2048 Ustası",
                unlocked: false
            },


            score10000: {
                title: "🔥 10.000 Skor",
                unlocked: false
            }

        };


        this.load();

    }




    check(score, board) {


        let maxTile = 0;


        for (let row of board.cells) {

            for (let tile of row) {

                if (tile > maxTile) {

                    maxTile = tile;

                }

            }

        }



        if (maxTile >= 128) {

            this.unlock("first128");

        }


        if (maxTile >= 512) {

            this.unlock("first512");

        }


        if (maxTile >= 1024) {

            this.unlock("first1024");

        }


        if (maxTile >= 2048) {

            this.unlock("master2048");

        }



        if (score >= 10000) {

            this.unlock("score10000");

        }


    }




    unlock(id) {


        if (!this.achievements[id].unlocked) {


            this.achievements[id].unlocked = true;


            alert(
                "🏆 Başarım Açıldı: " +
                this.achievements[id].title
            );


            this.save();


        }

    }




    save() {


        localStorage.setItem(

            this.key,

            JSON.stringify(this.achievements)

        );


    }





    load() {


        let data =
            localStorage.getItem(this.key);



        if (data) {

            this.achievements =
                JSON.parse(data);

        }


    }




    getUnlocked() {


        return Object.values(
            this.achievements
        )
        .filter(item => item.unlocked);


    }


}