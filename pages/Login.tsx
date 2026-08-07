import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { db } from '../firebase'; // 引入 db
import { doc, setDoc } from 'firebase/firestore'; // 引入寫入工具
import { mockStores, mockEmployees, mockVendors, mockMaterials, mockRevenue } from '../store/mockData'; // 引入假資料
import { Store as StoreIcon, Lock, User, CloudSync } from 'lucide-react';

export function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false); // 防止重複點擊
  
  const { login } = useAppContext();

  // --- 關鍵功能：一鍵將 Mock Data 上傳到 Firebase ---
  const handleInitDatabase = async () => {
    if (!confirm("這將會把預設的員工、物料、分店資料上傳到雲端，確定嗎？")) return;
    
    setIsInitializing(true);
    try {
      // 1. 上傳分店
      for (const s of mockStores) { await setDoc(doc(db, "stores", s.id), s); }
      // 2. 上傳員工 (包含密碼)
      for (const e of mockEmployees) { await setDoc(doc(db, "employees", e.id), e); }
      // 3. 上傳廠商
      for (const v of mockVendors) { await setDoc(doc(db, "vendors", v.id), v); }
      // 4. 上傳物料清單
      for (const m of mockMaterials) { await setDoc(doc(db, "materials", m.id), m); }
      // 5. 上傳初始營業額
      for (const r of mockRevenue) { await setDoc(doc(db, "revenues", r.id), r); }

      alert("🎉 雲端資料庫初始化成功！現在你可以使用測試帳號登入了。");
    } catch (err) {
      console.error(err);
      alert("初始化失敗，請檢查 Firebase 設定或瀏覽器 Console。");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password) {
      setError('請輸入帳號與密碼');
      return;
    }
    
    const success = login(account, password);
    if (!success) {
      setError('帳號或密碼錯誤 (或是雲端資料尚未建立)');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-green-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <StoreIcon className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">食見生活管理系統</h1>
          <p className="text-gray-500 mt-2 text-sm">請登入以繼續操作</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">登入帳號</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-gray-50 outline-none transition-all"
                placeholder="帳號 (如 boss)"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-gray-50 outline-none transition-all"
                placeholder="密碼 (預設: 123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            登入系統
          </button>
        </form>

        {/* --- 這是開發者按鈕，幫你把資料塞進去 --- */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleInitDatabase}
            disabled={isInitializing}
            className="w-full py-2 px-4 border-2 border-dashed border-green-300 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <CloudSync size={18} />
            {isInitializing ? '資料同步中...' : '首次使用：初始化雲端資料庫'}
          </button>
          <p className="mt-2 text-[10px] text-gray-400 text-center">
            提示：點擊按鈕後，雲端 Firestore 就會擁有預設測試帳號。
          </p>
        </div>
      </div>
    </div>
  );
}
