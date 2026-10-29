
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHa1xVqw8hM_8Zdqhoblx0Do5VDi6fPIQ",
    authDomain: "aftermath-8d48a.firebaseapp.com",
    databaseURL: "https://aftermath-8d48a-default-rtdb.firebaseio.com",
    projectId: "aftermath-8d48a",
    storageBucket: "aftermath-8d48a.firebasestorage.app",
    messagingSenderId: "750397725787",
    appId: "1:750397725787:web:7717df86db1687e077337e"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
