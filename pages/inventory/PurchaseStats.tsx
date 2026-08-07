import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { BarChart2, Calendar as CalendarIcon, DollarSign, Package } from 'lucide-react';

type DateRange = 'week' | 'month' | 'custom';

export function PurchaseStats() {
  const { materials, vendors, transactions, selectedStoreId } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const currentInterval = useMemo(() => {
    const today = new Date();
    if (dateRange === 'week') {
      return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    } else if (dateRange === 'month') {
      return { start: startOfMonth(today), end: endOfMonth(today) };
    } else {
      return { start: parseISO(customStart), end: parseISO(customEnd) };
    }
  }, [dateRange, customStart, customEnd]);

  const stats = useMemo(() => {
    const filteredTx = transactions.filter(t => 
      t.type === 'inbound' && 
      (selectedStoreId === 'all' || t.storeId === selectedStoreId) &&
      isWithinInterval(parseISO(t.date), currentInterval)
    );

    const vendorTotals: Record<string, number> = {};
    const materialStats: Record<string, { qty: number; amount: number }> = {};
    let grandTotal = 0;

    filteredTx.forEach(tx => {
      const mat = materials.find(m => m.id === tx.materialId);
      if (!mat) return;

      const amount = tx.price || 0; // Assuming price here is total amount
      const vendorId = tx.actualVendor ? 'v-other' : mat.vendorId; // Simplification, handle other vendors better if needed

      vendorTotals[vendorId] = (vendorTotals[vendorId] || 0) + amount;
      
      if (!materialStats[mat.id]) {
        materialStats[mat.id] = { qty: 0, amount: 0 };
      }
      materialStats[mat.id].qty += tx.quantity;
      materialStats[mat.id].amount += amount;

      grandTotal += amount;
    });

    return { vendorTotals, materialStats, grandTotal };
  }, [transactions, materials, selectedStoreId, currentInterval]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAF9] p-6 overflow-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">採購統計</h2>
          <p className="text-sm text-gray-500 mt-1">查看各廠商與物料的採購總量及總金額</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['week', 'month', 'custom'] as DateRange[]).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === r ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'week' ? '本週' : r === 'month' ? '本月' : '自訂'}
              </button>
            ))}
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-sm text-gray-800"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-sm text-gray-800"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">期間總採購額</p>
            <p className="text-2xl font-bold text-gray-800">${stats.grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {vendors.map(vendor => {
          const totalAmount = stats.vendorTotals[vendor.id] || 0;
          if (totalAmount === 0) return null;

          const vendorMaterials = materials.filter(m => m.vendorId === vendor.id);

          return (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{vendor.name}</h3>
                <div className="text-green-600 font-bold text-lg">
                  總計: ${totalAmount.toLocaleString()}
                </div>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-gray-500">
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">物料名稱</th>
                      <th className="px-6 py-4 font-medium text-right">採購數量</th>
                      <th className="px-6 py-4 font-medium text-right">採購總金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vendorMaterials.map(mat => {
                      const mStats = stats.materialStats[mat.id];
                      if (!mStats || mStats.qty === 0) return null;

                      return (
                        <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {mat.name} <span className="text-xs text-gray-400 font-normal ml-1">({mat.unit})</span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600 font-medium">
                            {mStats.qty.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-800 font-bold">
                            ${mStats.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
