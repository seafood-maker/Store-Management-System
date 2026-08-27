import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval, 
  addDays, subDays, startOfMonth, endOfMonth, isSameDay, parseISO 
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Trash2, LayoutGrid, List 
} from 'lucide-react';
import { Shift } from '../../types';

export function ScheduleSystem() {
  const { employees, stores, selectedStoreId, shifts, addShift, deleteShift, currentUser } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShift, setNewShift] = useState({
    employeeId: '', startTime: '09:00', endTime: '18:00', date: format(new Date(), 'yyyy-MM-dd')
  });

  // 權限檢查
  const canEdit = currentUser?.role === 'boss' || currentUser?.role === 'manager';

  // 取得當前視圖的日期範圍
  const days = viewMode === 'week' 
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) })
    : eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.employeeId || selectedStoreId === 'all') {
      alert("請選擇員工與分店");
      return;
    }
    await addShift({
      ...newShift,
      storeId: selectedStoreId as string,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具列 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            {format(currentDate, viewMode === 'week' ? 'yyyy年 MMM' : 'yyyy年 MMMM', { locale: zhTW })}
          </h3>
          <div className="flex bg-white border rounded-lg overflow-hidden shadow-sm">
            <button onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'week' ? 7 : 30))} className="p-2 hover:bg-gray-50 border-r"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-gray-50 border-r">今天</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 30))} className="p-2 hover:bg-gray-50"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button 
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
              <List size={16}/> 週視圖
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
              <LayoutGrid size={16}/> 月視圖
            </button>
          </div>
          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"
            >
              <Plus size={18}/> 新增排班
            </button>
          )}
        </div>
      </div>

      {/* 排班表內容 */}
      <div className="flex-1 overflow-auto bg-white border rounded-xl shadow-sm">
        {viewMode === 'week' ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 border-r w-32 text-gray-500 font-medium">員工</th>
                {days.map(day => (
                  <th key={day.toString()} className={`p-4 border-r min-w-[120px] ${isSameDay(day, new Date()) ? 'bg-green-50' : ''}`}>
                    <div className="text-xs text-gray-400 uppercase">{format(day, 'EEE', { locale: zhTW })}</div>
                    <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-green-600 font-bold' : 'text-gray-700'}`}>{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(e => e.status !== 'frozen' && (selectedStoreId === 'all' || e.storeId === selectedStoreId))
                .map(emp => (
                <tr key={emp.id} className="border-b">
                  <td className="p-4 border-r font-bold text-gray-700 bg-gray-50/30">
                    {emp.role === 'boss' ? '楷軒(海鮮)' : emp.name}
                  </td>
                  {days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === dayStr);
                    return (
                      <td key={dayStr} className="p-2 border-r align-top">
                        {dayShifts.map(s => (
                          <div key={s.id} className="mb-1 p-2 bg-green-100 text-green-800 rounded-md text-xs group relative">
                            <div className="font-bold">{s.startTime} - {s.endTime}</div>
                            {canEdit && (
                              <button 
                                onClick={() => deleteShift(s.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded transition-opacity"
                              >
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* 月視圖：簡易日曆 */
          <div className="grid grid-cols-7 h-full">
            {['一', '二', '三', '四', '五', '六', '日'].map(d => (
              <div key={d} className="p-2 text-center bg-gray-50 border-b border-r text-gray-400 text-xs font-bold">{d}</div>
            ))}
            {days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayShifts = shifts.filter(s => s.date === dayStr && (selectedStoreId === 'all' || s.storeId === selectedStoreId));
              return (
                <div key={dayStr} className={`min-h-[120px] p-2 border-b border-r hover:bg-gray-50 transition-colors ${isSameDay(day, new Date()) ? 'bg-green-50/50' : ''}`}>
                  <div className={`text-sm font-bold mb-2 ${isSameDay(day, new Date()) ? 'text-green-600' : 'text-gray-400'}`}>{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayShifts.slice(0, 3).map(s => {
                      const empName = employees.find(e => e.id === s.employeeId)?.name;
                      return (
                        <div key={s.id} className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded truncate">
                          {s.startTime} {empName}
                        </div>
                      );
                    })}
                    {dayShifts.length > 3 && <div className="text-[10px] text-gray-400 text-center">還有 {dayShifts.length - 3} 人...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 新增排班彈窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-green-600 p-4 text-white font-bold">新增排班紀錄</div>
            <form onSubmit={handleAddShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">選擇員工</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={newShift.employeeId}
                  onChange={e => setNewShift({...newShift, employeeId: e.target.value})}
                  required
                >
                  <option value="">請選擇員工...</option>
                  {employees.filter(e => e.status !== 'frozen').map(e => (
                    <option key={e.id} value={e.id}>{e.role === 'boss' ? '楷軒(海鮮)' : e.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">開始時間</label>
                  <input type="time" className="w-full border rounded-lg p-2" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">結束時間</label>
                  <input type="time" className="w-full border rounded-lg p-2" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">日期</label>
                <input type="date" className="w-full border rounded-lg p-2" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg">取消</button>
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold">確認排班</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
