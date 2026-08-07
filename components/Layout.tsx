import React from 'react';
import { LayoutDashboard, Users, Package, TrendingUp, Store as StoreIcon } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { stores, selectedStoreId, setSelectedStoreId, currentView, setCurrentView, currentUser, logout } = useAppContext();

  if (!currentUser) return null;

  const navItems = [
    { id: 'dashboard' as ViewState, label: '總覽首頁', icon: <LayoutDashboard size={20} />, roles: ['boss'] },
    { id: 'hr' as ViewState, label: '人力管理', icon: <Users size={20} />, roles: ['boss', 'manager'] },
    { id: 'inventory' as ViewState, label: '物料管理', icon: <Package size={20} />, roles: ['boss', 'manager', 'staff'] },
    { id: 'sales' as ViewState, label: '營業分析', icon: <TrendingUp size={20} />, roles: ['boss'] },
  ].filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-green-50 border-r border-green-100 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-green-800">
          <StoreIcon className="text-green-600" size={28} />
          <h1 className="text-xl font-bold tracking-tight">店鋪管理系統</h1>
        </div>

        <div className="px-4 py-2 mb-4 space-y-4">
          {currentUser.role === 'boss' ? (
            <div>
              <label className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2 block">
                選擇分店
              </label>
              <select
                className="w-full bg-white border border-green-200 text-green-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 outline-none transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
              >
                <option value="all">所有分店總表</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-green-100 text-green-800 text-sm font-medium px-4 py-3 rounded-lg flex items-center gap-2">
              <StoreIcon size={16} />
              {stores.find(s => s.id === currentUser.storeId)?.name}
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : 'text-green-800 hover:bg-green-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-green-100 flex flex-col gap-3">
          <div className="text-sm font-medium text-green-800 bg-white/50 px-3 py-2 rounded-lg text-center">
            {currentUser.name} ({currentUser.role === 'boss' ? '老闆' : currentUser.role === 'manager' ? '店長' : '店員'})
          </div>
          <button 
            onClick={logout}
            className="w-full py-2.5 text-sm text-green-700 bg-white border border-green-200 rounded-xl hover:bg-green-100 transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAF9]">
        <header className="h-16 bg-white border-b border-green-100 flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find((i) => i.id === currentView)?.label}
            <span className="ml-2 text-sm font-normal text-gray-500">
              / {selectedStoreId === 'all' ? '所有分店總表' : stores.find(s => s.id === selectedStoreId)?.name}
            </span>
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
