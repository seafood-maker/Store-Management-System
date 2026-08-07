import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Truck, PackageSearch, ClipboardList, TrendingDown, BarChart2 } from 'lucide-react';
import { DailyInbound } from './DailyInbound';
import { InventoryCount } from './InventoryCount';
import { PurchaseStats } from './PurchaseStats';
import { MaterialsManager } from './MaterialsManager';

export function InventorySystem() {
  const { materials, vendors, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'vendors' | 'materials' | 'daily' | 'count' | 'stats'>(
    currentUser.role === 'staff' ? 'daily' : 'materials'
  );

  const tabs = [
    { id: 'vendors' as const, label: '廠商管理', icon: <Truck size={18} />, roles: ['boss', 'manager'] },
    { id: 'materials' as const, label: '物料品項', icon: <PackageSearch size={18} />, roles: ['boss', 'manager'] },
    { id: 'daily' as const, label: '每日進貨與消耗', icon: <TrendingDown size={18} />, roles: ['boss', 'manager', 'staff'] },
    { id: 'count' as const, label: '盤點與損耗分析', icon: <ClipboardList size={18} />, roles: ['boss', 'manager'] },
    { id: 'stats' as const, label: '採購統計', icon: <BarChart2 size={18} />, roles: ['boss'] },
  ].filter(t => t.roles.includes(currentUser.role));

  React.useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [currentUser.role, activeTab, tabs]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {activeTab === 'vendors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">合作廠商</h3>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors">
                + 新增廠商
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => (
                <div key={v.id} className="p-4 border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-sm transition-all bg-gray-50/30">
                  <h4 className="font-semibold text-gray-800">{v.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">供應品項: {materials.filter(m => m.vendorId === v.id).length} 項</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="h-full">
            <MaterialsManager />
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="h-full">
            <DailyInbound />
          </div>
        )}

        {activeTab === 'count' && (
          <div className="h-full">
            <InventoryCount />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="h-full">
            <PurchaseStats />
          </div>
        )}
      </div>
    </div>
  );
}
