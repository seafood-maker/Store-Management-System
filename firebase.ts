import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 必須引入這行才能用資料庫

const firebaseConfig = {
  apiKey: "AIzaSyD0sOH2DSxjkquBXBE0NhVs7wQqPedTeIc",
  authDomain: "store-management-system-4ac33.firebaseapp.com",
  projectId: "store-management-system-4ac33",
  storageBucket: "store-management-system-4ac33.firebasestorage.app",
  messagingSenderId: "534207416873",
  appId: "1:534207416873:web:02e598e44de5433f51ea38",
  measurementId: "G-BDBRJ5BELV"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore 並匯出給全站使用 (這是關鍵)
export const db = getFirestore(app);
