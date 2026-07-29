import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
    getFirestore 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyAYFP6B_nK5wpsDes8h0bOcyOAcvRNpvfc",

    authDomain: "novaplay-5fc85.firebaseapp.com",

    projectId: "novaplay-5fc85",

    storageBucket: "novaplay-5fc85.firebasestorage.app",

    messagingSenderId: "144086098290",

    appId: "1:144086098290:web:d36c076f4cce2cc197fdeb"

};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);