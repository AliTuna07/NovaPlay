import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCkj652ZPdKXLzX8lyguQYbKK-fbraPYi4",
    authDomain: "novabridge-24925.firebaseapp.com",
    databaseURL: "https://novabridge-24925-default-rtdb.firebaseio.com",
    projectId: "novabridge-24925",
    storageBucket: "novabridge-24925.firebasestorage.app",
    messagingSenderId: "101301464628",
    appId: "1:101301464628:web:aedad930496f184ffca461"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);