import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCciapxh5GdF5JF-ZHfxKYuUpW0PCvM5w4",
  authDomain: "experiencia-senior-laboral.firebaseapp.com",
  projectId: "experiencia-senior-laboral",
  storageBucket: "experiencia-senior-laboral.firebasestorage.app",
  messagingSenderId: "332165850094",
  appId: "1:332165850094:web:2e222a3c728840d68ce4ff",
  measurementId: "G-K6QN6QL12J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
