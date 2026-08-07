import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { mockStores, mockEmployees, mockVendors, mockMaterials, mockRevenue } from '../store/mockData';
import { Store as StoreIcon, Lock, User, RefreshCw } from 'lucide-react';

export function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { login } = useAppContext();

  const handleInitDatabase = async () => {
    if (!confirm("確定要將初始資料上傳至雲端嗎？")) return;
    setIsInitializing(true);
    try {
      for (const s of mockStores) { await setDoc(doc(db, "stores", s.id), s); }
      for (const e of mockEmployees) { await setDoc(doc(db, "employees", e.id), e); }
      for (const v of mockVendors) { await setDoc(doc(db, "vendors", v.id), v); }
      for (const m of mockMaterials) { await setDoc(doc(db, "materials", m.id), m); }
      for (const r of mockRevenue) { await setDoc(doc(db, "revenues", r.id), r); }
      alert("初始化成功！請重新整理網頁後登入。");
    } catch (err) {
      console.error(err);
      alert("初始化失敗，請確認 Firebase 安全規則設定為測試模式。");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(account, password)) {
      setError('帳號或密碼錯誤 (或雲端資料尚未建立)');
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
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">{error}</div>}
          <input type="text" className="w-full p-3 border rounded-xl" placeholder="帳號" value={account} onChange={(e) => setAccount(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-xl" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl">登入系統</button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button onClick={handleInitDatabase} disabled={isInitializing} className="w-full py-2 border-2 border-dashed border-green-300 rounded-xl text-sm text-green-600 flex items-center justify-center gap-2">
            <RefreshCw size={18} className={isInitializing ? 'animate-spin' : ''} />
            {isInitializing ? '同步中...' : '首次使用：點此初始化雲端資料庫'}
          </button>
        </div>
      </div>
    </div>
  );
}
