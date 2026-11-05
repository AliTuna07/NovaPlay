
/* ==========================================
   NovaPlay Firebase
   Authentication + Firestore + RTDB + Storage
========================================== */

// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Authentication
import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Firestore
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Realtime Database
import {
    getDatabase,
    ref,
    push,
    set,
    update,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Storage
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


/* ==========================================
   FIREBASE CONFIG
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
   FIREBASE BAŞLAT
========================================== */

const app = initializeApp(firebaseConfig);


/* ==========================================
   AUTHENTICATION
========================================== */

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* ==========================================
   FIRESTORE
========================================== */

const firestore = getFirestore(app);


/* ==========================================
   REALTIME DATABASE
========================================== */

const db = getDatabase(app);


/* ==========================================
   STORAGE
========================================== */

const storage = getStorage(app);


/* ==========================================
   EXPORT
========================================== */

export {

    // Firebase
    app,

    // Authentication
    auth,
    googleProvider,

    // Firestore
    firestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    runTransaction,

    // Realtime Database
    db,
    ref,
    push,
    set,
    update,
    onValue,
    remove,

    // Storage
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL

};
