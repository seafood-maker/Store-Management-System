// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0sOH2DSxjkquBXBE0NhVs7wQqPedTeIc",
  authDomain: "store-management-system-4ac33.firebaseapp.com",
  projectId: "store-management-system-4ac33",
  storageBucket: "store-management-system-4ac33.firebasestorage.app",
  messagingSenderId: "534207416873",
  appId: "1:534207416873:web:02e598e44de5433f51ea38",
  measurementId: "G-BDBRJ5BELV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
