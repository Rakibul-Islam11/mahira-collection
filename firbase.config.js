// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClBJkB2VNBvPDMjxJ49yrv8OluDiOqbPI",
  authDomain: "mahira-collection.firebaseapp.com",
  projectId: "mahira-collection",
  storageBucket: "mahira-collection.firebasestorage.app",
  messagingSenderId: "849673617672",
  appId: "1:849673617672:web:beeb003de0c8e64a072cbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize for authentication
export const auth = getAuth()
const googleProvider = new GoogleAuthProvider();
export {googleProvider };
// Initialize for database
export const db = getFirestore(app);