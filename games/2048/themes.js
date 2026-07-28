class ThemeManager {


    constructor() {

        this.key = "NovaPlay_2048_Theme";


        this.themes = {

            classic: {

                name: "Klasik",

                background: "#faf8ef",

                board: "#bbada0"

            },


            dark: {

                name: "Karanlık",

                background: "#141414",

                board: "#333333"

            },


            nova: {

                name: "Nova",

                background:
                    "radial-gradient(circle at top,#243b55,#141e30)",

                board:
                    "rgba(255,255,255,0.15)"

            }

        };


        this.current =
            localStorage.getItem(this.key)
            || "nova";


    }



    apply(themeName) {


        if (!this.themes[themeName]) {

            themeName = "nova";

        }


        this.current = themeName;


        let theme =
            this.themes[themeName];


        document.body.style.background =
            theme.background;


        let board =
            document.getElementById("board");


        if (board) {

            board.style.background =
                theme.board;

        }


        localStorage.setItem(
            this.key,
            themeName
        );


    }



    getCurrent() {

        return this.current;

    }



    getThemes() {

        return this.themes;

    }


}