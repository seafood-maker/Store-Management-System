import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 務必補上這行

const firebaseConfig = {
  apiKey: "AIzaSyD0sOH2DSxjkquBXBE0NhVs7wQqPedTeIc",
  authDomain: "store-management-system-4ac33.firebaseapp.com",
  projectId: "store-management-system-4ac33",
  storageBucket: "store-management-system-4ac33.firebasestorage.app",
  messagingSenderId: "534207416873",
  appId: "1:534207416873:web:02e598e44de5433f51ea38",
  measurementId: "G-BDBRJ5BELV"
};

const app = initializeApp(firebaseConfig);

// 核心修正：一定要導出 db，其它檔案（如 AppContext）才抓得到它
export const db = getFirestore(app);
