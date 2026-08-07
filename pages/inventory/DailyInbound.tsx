import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, Save, AlertCircle } from 'lucide-react';

export function DailyInbound() {
  const { materials, vendors, selectedStoreId, transactions, saveDailyInbound } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formData, setFormData] = useState<Record<string, { quantity: string; price: string; actualVendor?: string }>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-fill existing transactions for the selected date and store
  useEffect(() => {
    if (selectedStoreId === 'all') return;
    
    const existingTx = transactions.filter(
      t => t.date === selectedDate && t.storeId === selectedStoreId && t.type === 'inbound'
    );
    
    const initialData: typeof formData = {};
    existingTx.forEach(tx => {
      initialData[tx.materialId] = {
        quantity: tx.quantity.toString(),
        price: tx.price ? tx.price.toString() : '',
        actualVendor: tx.actualVendor || ''
      };
    });
    setFormData(initialData);
  }, [selectedDate, selectedStoreId, transactions]);

  // Handle input change
  const handleInputChange = (materialId: string, field: 'quantity' | 'price' | 'actualVendor', value: string) => {
    setFormData(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: value,
      }
    }));
  };

  // Group materials by vendor
  const materialsByVendor = useMemo(() => {
    const grouped: Record<string, typeof materials> = {};
    vendors.forEach(v => grouped[v.id] = []);
    materials.forEach(m => {
      if (grouped[m.vendorId]) {
        grouped[m.vendorId].push(m);
      }
    });
    return grouped;
  }, [materials, vendors]);

  // Compute summary
  const summary = useMemo(() => {
    let totalItems = 0;
    let totalAmount = 0;
    const amountByVendor: Record<string, number> = {};

    Object.entries(formData).forEach(([materialId, data]: [string, any]) => {
      const q = parseFloat(data.quantity);
      const p = parseFloat(data.price);
      if (!isNaN(q) && q > 0) {
        totalItems += 1;
        
        const mat = materials.find(m => m.id === materialId);
        if (mat) {
          const itemTotal = !isNaN(p) ? p : 0; // Assuming the price entered is the total amount for that item.
          totalAmount += itemTotal;
          
          amountByVendor[mat.vendorId] = (amountByVendor[mat.vendorId] || 0) + itemTotal;
        }
      }
    });

    return { totalItems, totalAmount, amountByVendor };
  }, [formData, materials]);

  const handleConfirm = () => {
    if (selectedStoreId === 'all') {
      alert('請先選擇單一分店再進行登記');
      return;
    }
    
    const records = Object.entries(formData)
      .filter(([_, data]: [string, any]) => {
        const q = parseFloat(data.quantity);
        return !isNaN(q) && q > 0;
      })
      .map(([materialId, data]: [string, any]) => ({
        materialId,
        quantity: parseFloat(data.quantity),
        price: parseFloat(data.price) || undefined,
        actualVendor: data.actualVendor || undefined,
      }));

    saveDailyInbound(selectedDate, selectedStoreId, records);
    setShowConfirm(false);
    
    setSuccessMessage('進貨資料已成功上傳！');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (selectedStoreId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <AlertCircle size={48} className="text-orange-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">請選擇分店</h3>
        <p>總表模式下無法登記物料，請於左側選單切換至特定分店。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAF9]">
      {/* Header & Date Selection */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">每日進貨登記</h2>
          <p className="text-sm text-gray-500 mt-1">快速登記當日向各廠商採購的物料數量與總價</p>
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

      {/* Main Vendor Cards Grid */}
      <div className="flex-1 overflow-auto space-y-6 pb-32">
        {vendors.map(vendor => {
          const vendorMaterials = materialsByVendor[vendor.id];
          if (!vendorMaterials || vendorMaterials.length === 0) return null;
          
          const isOtherVendor = vendor.id === 'v-other';

          return (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                <h3 className="text-lg font-bold text-green-900">{vendor.name}</h3>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 hidden md:table-header-group">
                    <tr>
                      <th className="px-6 py-2 font-medium w-1/3">物料名稱</th>
                      <th className="px-6 py-2 font-medium w-1/4">進貨數量</th>
                      <th className="px-6 py-2 font-medium w-1/4">進貨總價 ($)</th>
                      {isOtherVendor && <th className="px-6 py-2 font-medium w-1/4">實際廠商</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendorMaterials.map(mat => (
                      <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors flex flex-col md:table-row py-2 md:py-0">
                        <td className="px-6 md:py-2 font-medium text-gray-800 mb-1 md:mb-0">
                          {mat.name} <span className="text-xs text-gray-400 font-normal ml-1">({mat.unit})</span>
                        </td>
                        <td className="px-6 md:py-2 mb-1 md:mb-0">
                          <input 
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="數量"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                            value={formData[mat.id]?.quantity || ''}
                            onChange={(e) => handleInputChange(mat.id, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="px-6 md:py-2 mb-1 md:mb-0">
                          <input 
                            type="number"
                            min="0"
                            step="1"
                            placeholder="價格"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                            value={formData[mat.id]?.price || ''}
                            onChange={(e) => handleInputChange(mat.id, 'price', e.target.value)}
                          />
                        </td>
                        {isOtherVendor && (
                          <td className="px-6 md:py-2">
                            <input 
                              type="text"
                              placeholder="廠商名稱 (選填)"
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                              value={formData[mat.id]?.actualVendor || ''}
                              onChange={(e) => handleInputChange(mat.id, 'actualVendor', e.target.value)}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Summary Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-6 text-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">已登記品項</span>
            <span className="text-lg font-bold text-gray-800">{summary.totalItems} <span className="text-sm font-normal">項</span></span>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">今日進貨總額</span>
            <span className="text-2xl font-bold text-green-600">${summary.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={summary.totalItems === 0}
          className="w-full md:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Save size={20} />
          確認並上傳
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-green-600 p-6 text-white text-center">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-90" />
              <h3 className="text-xl font-bold">確認上傳進貨資料</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">進貨日期</span>
                <span className="font-semibold text-gray-800">{selectedDate.replace(/-/g, '/')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">登記品項數</span>
                <span className="font-semibold text-gray-800">{summary.totalItems} 項</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">各廠商採購額</span>
                <div className="text-right">
                  {Object.entries(summary.amountByVendor).map(([vId, amt]) => {
                    if (amt === 0) return null;
                    const vName = vendors.find(v => v.id === vId)?.name;
                    return (
                      <div key={vId} className="text-sm text-gray-600">
                        {vName}: ${amt.toLocaleString()}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-bold text-gray-700">進貨總額</span>
                <span className="text-xl font-bold text-green-600">${summary.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                返回修改
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors font-bold shadow-sm"
              >
                確認上傳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
