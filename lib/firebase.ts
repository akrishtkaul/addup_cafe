// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-qbtDAO7U9LDN29mmC7LRtYrd498ppBE",
  authDomain: "add-up-cafe.firebaseapp.com",
  projectId: "add-up-cafe",
  storageBucket: "add-up-cafe.firebasestorage.app",
  messagingSenderId: "781366223288",
  appId: "1:781366223288:web:aeda47c7613362bb06af4d",
  measurementId: "G-RELK5NRCBF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);