import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Users, Calendar, Award } from 'lucide-react';

export function HRSystem() {
  const [activeTab, setActiveTab] = useState<'employees' | 'schedule' | 'performance'>('employees');
  const { employees, stores, selectedStoreId, currentUser } = useAppContext();

  const filteredEmployees = employees.filter(
    (e) => selectedStoreId === 'all' || e.storeId === selectedStoreId
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'employees' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={18} /> 人員名單
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'schedule' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={18} /> 排班表與出勤
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'performance' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award size={18} /> 考核系統
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {activeTab === 'employees' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">人員名單</h3>
              {currentUser?.role === 'boss' && (
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors">
                  + 新增員工
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 font-semibold">姓名</th>
                    <th className="px-6 py-3 font-semibold">所屬分店</th>
                    <th className="px-6 py-3 font-semibold">職位</th>
                    <th className="px-6 py-3 font-semibold">時薪/月薪</th>
                    <th className="px-6 py-3 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                          {stores.find(s => s.id === emp.storeId)?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">{emp.role}</td>
                      <td className="px-6 py-4">${emp.hourlyRate} / hr</td>
                      <td className="px-6 py-4">
                        <button className="text-green-600 hover:text-green-800 font-medium mr-3">編輯</button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        此分店目前無人員資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Calendar size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">排班表與出勤系統</h3>
            <p>可在此介面安排人員班表，並記錄每日實際出勤狀況與打卡時間。</p>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Award size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">員工考核與績效系統</h3>
            <p>紀錄員工表現、設定考核標準，並連結薪資調整參考。</p>
          </div>
        )}
      </div>
    </div>
  );
}
