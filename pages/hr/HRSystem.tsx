import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Users, Calendar, Award, Check, X, Edit2 } from 'lucide-react';
import { Employee, Role, EmploymentType } from '../../types';
// 1. 引入剛剛實作完成的智慧排班組件
import { SmartSchedule } from './SmartSchedule'; 

export function HRSystem() {
  const [activeTab, setActiveTab] = useState<'employees' | 'schedule' | 'performance'>('employees');
  const { employees, stores, selectedStoreId, currentUser, updateEmployee } = useAppContext();
  
  // --- 編輯狀態管理 ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  // 根據選擇的分店過濾員工
  const filteredEmployees = employees.filter(
    (e) => selectedStoreId === 'all' || e.storeId === selectedStoreId
  );

  const startEditing = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm(emp);
  };

  const handleSave = async (id: string) => {
    try {
      await updateEmployee(id, editForm);
      setEditingId(null);
    } catch (error) {
      console.error("更新失敗:", error);
      alert("更新資料時發生錯誤");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* --- Tabs 選單 --- */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 shrink-0">
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
          <Calendar size={18} /> 智慧排班表
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

      {/* --- Content 區域 --- */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 1. 人員名單管理 */}
        {activeTab === 'employees' && (
          <div className="p-6 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">人員名單管理</h3>
              {currentUser?.role === 'boss' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all text-sm">
                  + 新增員工
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">姓名</th>
                    <th className="px-6 py-3">所屬分店</th>
                    <th className="px-6 py-3">職位</th>
                    <th className="px-6 py-3">類型</th>
                    <th className="px-6 py-3">薪資設定</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredEmployees.map((emp) => {
                    const isEditing = editingId === emp.id;
                    const isBoss = currentUser?.role === 'boss';

                    return (
                      <tr key={emp.id} className="hover:bg-green-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select 
                              className="border rounded-lg px-2 py-1 bg-white text-xs"
                              value={editForm.storeId}
                              onChange={e => setEditForm({...editForm, storeId: e.target.value})}
                            >
                              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                              {stores.find(s => s.id === emp.storeId)?.name || '未指定'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select 
                              className="border rounded-lg px-2 py-1 bg-white text-xs"
                              value={editForm.role}
                              onChange={e => setEditForm({...editForm, role: e.target.value as Role})}
                            >
                              <option value="boss">老闆</option>
                              <option value="manager">店長</option>
                              <option value="staff">店員</option>
                            </select>
                          ) : (
                            <span className={`font-medium ${emp.role === 'boss' ? 'text-purple-600' : emp.role === 'manager' ? 'text-blue-600' : 'text-gray-500'}`}>
                              {emp.role === 'boss' ? '老闆' : emp.role === 'manager' ? '店長' : '店員'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select 
                              className="border rounded-lg px-2 py-1 bg-white text-xs"
                              value={editForm.employmentType}
                              onChange={e => setEditForm({...editForm, employmentType: e.target.value as EmploymentType})}
                            >
                              <option value="full-time">正職</option>
                              <option value="part-time">兼職</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.employmentType === 'full-time' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                              {emp.employmentType === 'full-time' ? '正職' : '兼職'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 text-xs">$</span>
                              <input 
                                type="number" 
                                className="border rounded-lg px-2 py-1 w-20 text-xs"
                                value={editForm.hourlyRate}
                                onChange={e => setEditForm({...editForm, hourlyRate: parseInt(e.target.value)})}
                              />
                            </div>
                          ) : (
                            <span className="font-mono text-green-700 font-semibold">
                              ${emp.hourlyRate} <span className="text-[10px] font-normal text-gray-400">/ hr</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isBoss && (
                            isEditing ? (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleSave(emp.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="儲存"><Check size={16}/></button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="取消"><X size={16}/></button>
                              </div>
                            ) : (
                              <button onClick={() => startEditing(emp)} className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium hover:underline">
                                <Edit2 size={13}/> 編輯
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic">此分店目前無人員資料</div>
              )}
            </div>
          </div>
        )}

        {/* 2. 修改後的智慧排班表：直接引入 SmartSchedule */}
        {activeTab === 'schedule' && (
          <div className="flex-1 p-4 overflow-hidden">
            <SmartSchedule />
          </div>
        )}

        {/* 3. 考核系統 (保持原有的佔位內容) */}
        {activeTab === 'performance' && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
            <Award size={48} className="text-green-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">員工考核與績效系統</h3>
            <p className="text-sm">紀錄員工表現、設定考核標準，並連結薪資調整參考。</p>
          </div>
        )}
      </div>
    </div>
  );
}
