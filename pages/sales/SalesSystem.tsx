import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { DollarSign, BarChart2, FileText } from 'lucide-react';

export function SalesSystem() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'pnl'>('daily');
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'daily' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign size={18} /> 每日營業額輸入
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'monthly' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 size={18} /> 月度報表
        </button>
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'pnl' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} /> 損益表 (P&L)
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {activeTab === 'daily' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <DollarSign size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">每日營業額紀錄</h3>
            <p>請於每日結帳後在此輸入各分店的總營業額。</p>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <BarChart2 size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">月度營收視覺化</h3>
            <p>統整每月份的營業趨勢圖表，方便快速掌握淡旺季與活動成效。</p>
          </div>
        )}

        {activeTab === 'pnl' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <FileText size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">綜合損益表</h3>
            <p>自動扣除所選期間之人力成本(依據打卡與時薪)、物料成本(依據消耗與單價)，計算最終淨利。</p>
          </div>
        )}
      </div>
    </div>
  );
}
