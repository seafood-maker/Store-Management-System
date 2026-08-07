import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Store as StoreIcon, Lock, User } from 'lucide-react';

export function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password) {
      setError('請輸入帳號與密碼');
      return;
    }
    
    const success = login(account, password);
    if (!success) {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-green-100/50 p-8 border border-green-100">
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
                placeholder="請輸入帳號 (如 boss, manager1)"
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
                placeholder="請輸入密碼 (預設: 123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            登入系統
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">測試帳號：</h3>
          <ul className="text-xs text-gray-500 space-y-2 bg-gray-50 p-4 rounded-xl">
            <li><span className="font-semibold text-gray-700">老闆:</span> boss / 123</li>
            <li><span className="font-semibold text-gray-700">育德店長:</span> manager1 / 123</li>
            <li><span className="font-semibold text-gray-700">育德店員:</span> staff1 / 123</li>
            <li><span className="font-semibold text-gray-700">大里店長:</span> manager2 / 123</li>
            <li><span className="font-semibold text-gray-700">大里店員:</span> staff2 / 123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
