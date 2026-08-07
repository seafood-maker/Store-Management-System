import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

export function Dashboard() {
  const { stores, selectedStoreId, revenues, employees, materials } = useAppContext();

  // Aggregate Data based on selected store
  const filteredRevenues = useMemo(() => {
    if (selectedStoreId === 'all') return revenues;
    return revenues.filter(r => r.storeId === selectedStoreId);
  }, [revenues, selectedStoreId]);

  const totalRevenue7Days = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7).toISOString().split('T')[0];
    return filteredRevenues
      .filter(r => r.date >= sevenDaysAgo)
      .reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRevenues]);

  const filteredEmployees = useMemo(() => {
    if (selectedStoreId === 'all') return employees;
    return employees.filter(e => e.storeId === selectedStoreId);
  }, [employees, selectedStoreId]);

  // Chart data
  const revenueChartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i).toISOString().split('T')[0];
      dataMap.set(d, 0);
    }
    
    filteredRevenues.forEach(r => {
      if (dataMap.has(r.date)) {
        dataMap.set(r.date, dataMap.get(r.date)! + r.amount);
      }
    });

    return Array.from(dataMap.entries()).map(([date, amount]) => ({
      date: format(parseISO(date), 'MM/dd'),
      amount
    }));
  }, [filteredRevenues]);

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="近七日總營業額" 
          value={`$${totalRevenue7Days.toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="在職人員總數" 
          value={`${filteredEmployees.length} 人`} 
          icon={Users} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="管理物料品項" 
          value={`${materials.length} 項`} 
          icon={Package} 
          colorClass="bg-teal-500" 
        />
        <StatCard 
          title="管理分店數" 
          value={selectedStoreId === 'all' ? stores.length : 1} 
          icon={TrendingUp} 
          colorClass="bg-cyan-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-500 rounded-full inline-block"></span>
            近七日營業額趨勢
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '營業額']}
                />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">營運狀況健康度</h3>
          <p className="text-gray-500 mb-6 max-w-sm">目前各項指標穩定，建議可前往「營業分析」查看更詳細的成本與利潤結構。</p>
          <button className="px-6 py-2 bg-green-100 text-green-700 font-medium rounded-full hover:bg-green-200 transition-colors">
            查看完整報表
          </button>
        </div>
      </div>
    </div>
  );
}
