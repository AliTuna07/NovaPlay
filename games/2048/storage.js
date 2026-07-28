class StorageManager {


    constructor(key) {

        this.key = key;

    }



    saveHighScore(score) {


        let current =
            this.getHighScore();


        if (score > current) {

            localStorage.setItem(
                this.key,
                score
            );

            return true;

        }


        return false;

    }




    getHighScore() {


        return Number(
            localStorage.getItem(this.key)
        ) || 0;


    }



    clear() {

        localStorage.removeItem(
            this.key
        );

    }


}