/* ==========================================
   NovaPlay Firebase
========================================== */
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    update,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
/* ==========================================
   Firebase Config
========================================== */

const firebaseConfig = {

    apiKey: "AIzaSyB2NsF1tHWr8CLJAwUaohqQWBo3e-C1e7I",

    authDomain: "novaplay-e34d6.firebaseapp.com",

    databaseURL: "https://novaplay-e34d6-default-rtdb.firebaseio.com",

    projectId: "novaplay-e34d6",

    storageBucket: "novaplay-e34d6.firebasestorage.app",

    messagingSenderId: "124607738607",

    appId: "1:124607738607:web:68c6541b3c0d2cc227a11a"

};

/* ==========================================
   Firebase Başlat
========================================== */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const storage = getStorage(app);
/* ==========================================
   Export
========================================== */

export {
    db,
    storage,

    ref,
    push,
    set,
    update,
    onValue,
    remove,

    storageRef,
    uploadBytes,
    getDownloadURL
};