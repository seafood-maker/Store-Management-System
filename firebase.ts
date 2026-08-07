import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 請將下方的資訊替換成你在 Firebase Console 獲得的真實代碼
const firebaseConfig = {
  apiKey: "你的API_KEY",
  authDomain: "你的專案.firebaseapp.com",
  projectId: "你的專案ID",
  storageBucket: "你的專案.appspot.com",
  messagingSenderId: "你的發送者ID",
  appId: "你的APP_ID"
};

const app = initializeApp(firebaseConfig);
// 初始化資料庫
export const db = getFirestore(app);
