import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, Save, AlertCircle } from 'lucide-react';

export function InventoryCount() {
  const { materials, selectedStoreId, transactions, saveInventoryCount } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formData, setFormData] = useState<Record<string, { actualQuantity: string; reason: string }>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate theoretical quantities
  const theoreticalQuantities = useMemo(() => {
    const qtys: Record<string, number> = {};
    if (selectedStoreId === 'all') return qtys;

    materials.forEach(mat => {
      // Very basic theoretical calculation: sum all inbound for this store up to the selected date
      const inboundSum = transactions
        .filter(t => t.storeId === selectedStoreId && t.materialId === mat.id && t.type === 'inbound' && t.date <= selectedDate)
        .reduce((acc, t) => acc + t.quantity, 0);
      
      // For a real app we'd subtract usage, add/subtract previous counts, etc.
      // We'll use inboundSum, or mock a number if 0 to show the UI
      qtys[mat.id] = inboundSum > 0 ? inboundSum : 100; 
    });
    return qtys;
  }, [materials, selectedStoreId, transactions, selectedDate]);

  // Auto-fill existing count transactions
  useEffect(() => {
    if (selectedStoreId === 'all') return;
    
    const existingTx = transactions.filter(
      t => t.date === selectedDate && t.storeId === selectedStoreId && t.type === 'count'
    );
    
    const initialData: typeof formData = {};
    existingTx.forEach(tx => {
      initialData[tx.materialId] = {
        actualQuantity: tx.quantity.toString(),
        reason: tx.reason || ''
      };
    });
    setFormData(initialData);
  }, [selectedDate, selectedStoreId, transactions]);

  const handleInputChange = (materialId: string, field: 'actualQuantity' | 'reason', value: string) => {
    setFormData(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: value,
      }
    }));
  };

  const getDifference = (materialId: string) => {
    const actualStr = formData[materialId]?.actualQuantity;
    if (!actualStr || isNaN(parseFloat(actualStr))) return null;
    const actual = parseFloat(actualStr);
    const theoretical = theoreticalQuantities[materialId] || 0;
    
    const diff = actual - theoretical;
    const percent = theoretical === 0 ? 0 : (diff / theoretical) * 100;
    
    return { diff, percent };
  };

  const isErrorExceeded = (materialId: string) => {
    const diffInfo = getDifference(materialId);
    if (!diffInfo) return false;
    const mat = materials.find(m => m.id === materialId);
    const maxError = mat?.acceptableErrorRate || 5; // default 5%
    return Math.abs(diffInfo.percent) > maxError;
  };

  const hasErrorsWithoutReasons = useMemo(() => {
    return materials.some(mat => {
      if (isErrorExceeded(mat.id)) {
        const reason = formData[mat.id]?.reason || '';
        if (reason.trim() === '') return true;
      }
      return false;
    });
  }, [formData, materials]);

  const totalItemsCounted = useMemo(() => {
    return Object.values(formData).filter((d: any) => d.actualQuantity !== '' && !isNaN(parseFloat(d.actualQuantity))).length;
  }, [formData]);

  const handleConfirm = () => {
    if (selectedStoreId === 'all') {
      alert('請先選擇單一分店再進行盤點');
      return;
    }
    
    const records = Object.entries(formData)
      .filter(([_, data]: [string, any]) => data.actualQuantity !== '' && !isNaN(parseFloat(data.actualQuantity)))
      .map(([materialId, data]: [string, any]) => ({
        materialId,
        quantity: parseFloat(data.actualQuantity),
        reason: data.reason || undefined,
        theoreticalQuantity: theoreticalQuantities[materialId]
      }));

    saveInventoryCount(selectedDate, selectedStoreId, records);
    setShowConfirm(false);
    
    setSuccessMessage('盤點資料已成功上傳更新！');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (selectedStoreId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <AlertCircle size={48} className="text-orange-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">請選擇分店</h3>
        <p>總表模式下無法進行盤點，請於左側選單切換至特定分店。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAF9]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">盤點與損耗分析</h2>
          <p className="text-sm text-gray-500 mt-1">輸入實際盤點量，系統將自動比對理論量並計算誤差，誤差過大時需填寫原因。</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <CalendarIcon className="text-green-600 ml-2" size={20} />
          <input 
            type="date" 
            className="bg-transparent border-none outline-none font-semibold text-gray-800 pr-2 cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-gray-100 pb-32">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-2 font-medium">物料名稱</th>
              <th className="px-6 py-2 font-medium">容許誤差</th>
              <th className="px-6 py-2 font-medium">理論量</th>
              <th className="px-6 py-2 font-medium">實際盤點量</th>
              <th className="px-6 py-2 font-medium">誤差狀態</th>
              <th className="px-6 py-2 font-medium w-1/4">異常原因</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map(mat => {
              const diffInfo = getDifference(mat.id);
              const errorExceeded = isErrorExceeded(mat.id);
              const maxError = mat.acceptableErrorRate || 5;

              return (
                <tr key={mat.id} className={`hover:bg-gray-50/50 transition-colors ${errorExceeded ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-2 font-medium text-gray-800">
                    {mat.name} <span className="text-xs text-gray-400 font-normal ml-1">({mat.unit})</span>
                  </td>
                  <td className="px-6 py-2 text-gray-500">
                    ±{maxError}%
                  </td>
                  <td className="px-6 py-2 text-gray-700 font-semibold">
                    {theoreticalQuantities[mat.id]}
                  </td>
                  <td className="px-6 py-2">
                    <input 
                      type="number"
                      step="0.1"
                      className={`w-28 bg-gray-50 border rounded-lg p-1.5 outline-none transition-shadow ${errorExceeded ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500'}`}
                      value={formData[mat.id]?.actualQuantity || ''}
                      onChange={(e) => handleInputChange(mat.id, 'actualQuantity', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-2">
                    {diffInfo ? (
                      <div className={`font-bold flex items-center gap-1 ${errorExceeded ? 'text-red-600' : 'text-green-600'}`}>
                        {diffInfo.diff > 0 ? '+' : ''}{diffInfo.diff.toFixed(1)}
                        <span className="text-xs">({diffInfo.percent > 0 ? '+' : ''}{diffInfo.percent.toFixed(1)}%)</span>
                        {errorExceeded && <AlertCircle size={14} className="ml-1" />}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-2">
                    <input 
                      type="text"
                      placeholder={errorExceeded ? "必須填寫原因" : "無異常"}
                      className={`w-full bg-gray-50 border rounded-lg p-1.5 outline-none transition-shadow ${errorExceeded ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-red-300' : 'border-transparent text-gray-500'}`}
                      value={formData[mat.id]?.reason || ''}
                      onChange={(e) => handleInputChange(mat.id, 'reason', e.target.value)}
                      disabled={!errorExceeded}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-6 text-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">已盤點品項</span>
            <span className="text-lg font-bold text-gray-800">{totalItemsCounted} / {materials.length}</span>
          </div>
          {hasErrorsWithoutReasons && (
            <div className="text-red-600 flex items-center gap-2 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              <AlertCircle size={16} />
              有異常項目未填寫原因，無法提送
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={totalItemsCounted === 0 || hasErrorsWithoutReasons}
          className="w-full md:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Save size={20} />
          提送盤點資料
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-green-600 p-6 text-white text-center">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-90" />
              <h3 className="text-xl font-bold">確認提送盤點</h3>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600 mb-6">
                您即將提送 {selectedDate.replace(/-/g, '/')} 的盤點資料，提送後系統將自動更新現有物料庫存。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  返回
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors font-bold shadow-sm"
                >
                  確認提送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
