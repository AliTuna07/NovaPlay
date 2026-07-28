class LeaderboardManager {


    constructor() {

        this.key = "NovaPlay_2048_Leaderboard";

    }



    addScore(name, score) {


        let scores = this.getScores();



        scores.push({

            name: name,

            score: score,

            date: new Date().toLocaleDateString()

        });



        scores.sort(
            (a,b) => b.score - a.score
        );



        scores = scores.slice(0,10);



        localStorage.setItem(

            this.key,

            JSON.stringify(scores)

        );


    }




    getScores() {


        let data =
            localStorage.getItem(this.key);



        if (!data) {

            return [];

        }


        return JSON.parse(data);


    }




    clear() {


        localStorage.removeItem(
            this.key
        );


    }



}