import React, { useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';

export function MaterialsManager() {
  const { materials, vendors } = useAppContext();

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

  return (
    <div className="flex flex-col h-full bg-[#F8FAF9]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">物料清單</h2>
          <p className="text-sm text-gray-500 mt-1">管理各廠商供應的物料品項與預設價格</p>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors">
          + 新增物料
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-6 pb-32">
        {vendors.map(vendor => {
          const vendorMaterials = materialsByVendor[vendor.id];
          if (!vendorMaterials || vendorMaterials.length === 0) return null;

          return (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-green-900">{vendor.name}</h3>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 hidden md:table-header-group">
                    <tr>
                      <th className="px-6 py-2 font-medium w-1/3">物料名稱</th>
                      <th className="px-6 py-2 font-medium w-1/6">單位</th>
                      <th className="px-6 py-2 font-medium w-1/6">進貨單價</th>
                      <th className="px-6 py-2 font-medium w-1/6">容許誤差</th>
                      <th className="px-6 py-2 font-medium w-1/6">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendorMaterials.map(mat => (
                      <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors flex flex-col md:table-row py-2 md:py-0">
                        <td className="px-6 md:py-2 font-medium text-gray-800 mb-1 md:mb-0">
                          {mat.name}
                        </td>
                        <td className="px-6 md:py-2 text-gray-600 mb-1 md:mb-0">
                          {mat.unit}
                        </td>
                        <td className="px-6 md:py-2 text-gray-600 mb-1 md:mb-0">
                          ${mat.currentPrice}
                        </td>
                        <td className="px-6 md:py-2 text-gray-600 mb-2 md:mb-0">
                          ±{mat.acceptableErrorRate || 5}%
                        </td>
                        <td className="px-6 md:py-2">
                          <button className="text-green-600 hover:text-green-800 font-medium">編輯</button>
                        </td>
                      </tr>
                    ))}
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
