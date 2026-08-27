import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  parse, differenceInMinutes, getDay, isSameMonth 
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { DailySchedule, StationType, PrepStationType } from '../../types';

export function SmartSchedule() {
  const { employees, dailySchedules, dailyTargets, updateDailySchedule } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentDate), end: endOfMonth(currentDate)
  }), [currentDate]);

  // --- 工具函數：計算工時 ---
  const calculateHours = (start: string, end: string, breakH: string) => {
    if (!start || !end) return 0;
    try {
      const s = parse(start, 'HH:mm', new Date());
      const e = parse(end, 'HH:mm', new Date());
      let diff = differenceInMinutes(e, s) / 60;
      if (diff < 0) diff += 24; // 處理跨日
      const breakNum = parseFloat(breakH) || 0;
      return Math.max(0, diff - breakNum);
    } catch { return 0; }
  };

  // --- 工具函數：檢查餐期人力覆蓋 (11:00-13:00) ---
  const checkMealCoverage = (dateStr: string) => {
    const dayShifts = dailySchedules.filter(s => s.date === dateStr && !s.isLeave);
    const coverage = { MT: false, OT: false, CT: false };
    
    dayShifts.forEach(s => {
      // 判斷該員工時段是否完整覆蓋 11:00 到 13:00
      const coversPeak = s.startTime <= "11:00" && s.endTime >= "13:00";
      if (coversPeak && (s.station === 'MT' || s.station === 'OT' || s.station === 'CT')) {
        coverage[s.station as keyof typeof coverage] = true;
      }
    });
    return coverage;
  };

  // --- 統一更新入口 ---
  const handleUpdate = (empId: string, dateStr: string, updates: Partial<DailySchedule>) => {
    const existing = dailySchedules.find(s => s.employeeId === empId && s.date === dateStr);
    
    const base: DailySchedule = existing || {
      employeeId: empId,
      date: dateStr,
      startTime: '',
      endTime: '',
      breakHours: '0',
      workHours: 0,
      station: '',
      prepStation: '',
      note: '',
      isLeave: false
    };

    const newData = { ...base, ...updates };
    
    // 重新計算工時 (如果更新了時間或休息)
    if (updates.startTime !== undefined || updates.endTime !== undefined || updates.breakHours !== undefined) {
      newData.workHours = calculateHours(newData.startTime, newData.endTime, newData.breakHours);
    }

    // 處理請假/休假邏輯
    if (newData.station === '休') {
      newData.isLeave = true;
      newData.workHours = 0;
    } else if (updates.station) {
      newData.isLeave = false;
    }

    updateDailySchedule(newData);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* 1. 頂部控制列 */}
      <div className="p-4 bg-green-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
            <button className="p-1 hover:bg-white/20 rounded" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft/></button>
            <h2 className="text-lg font-bold min-w-[120px] text-center">{format(currentDate, 'yyyy年 MM月')}</h2>
            <button className="p-1 hover:bg-white/20 rounded" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight/></button>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs opacity-90">
            <Info size={14}/> <span>提示：餐期檢查時間為 11:00 - 13:00</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12px] table-fixed min-w-[1200px]">
          <thead className="sticky top-0 z-30 bg-gray-100 shadow-sm font-bold text-gray-600">
            <tr>
              <th className="border p-2 w-28 sticky left-0 z-40 bg-gray-200" colSpan={2}>員工 / 日期</th>
              {days.map(d => (
                <th key={d.toString()} className={`border p-1 w-24 ${[0, 6].includes(getDay(d)) ? 'bg-orange-100 text-orange-700' : ''}`}>
                  <div>{format(d, 'd')}</div>
                  <div className="text-[10px]">{format(d, 'EE', { locale: zhTW })}</div>
                </th>
              ))}
              <th className="border p-2 w-20 bg-blue-50 text-blue-700">月總計</th>
            </tr>
          </thead>
          <tbody>
            {employees.filter(e => e.status !== 'frozen').map(emp => {
              // 計算該員工本月總工時
              const monthlyTotal = dailySchedules
                .filter(s => s.employeeId === emp.id && s.date.startsWith(format(currentDate, 'yyyy-MM')))
                .reduce((acc, curr) => acc + (curr.workHours || 0), 0);

              return (
                <React.Fragment key={emp.id}>
                  {/* 1. 上班時間 */}
                  <tr className="border-t-2 border-gray-400">
                    <td rowSpan={7} className="border p-2 font-bold text-center sticky left-0 z-20 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)] text-gray-800">
                      {emp.name}
                    </td>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold">上班</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className={`border p-0 ${s?.isLeave ? 'bg-gray-100' : ''}`}>
                          <input type="time" className="w-full p-1 bg-transparent outline-none focus:bg-green-50" value={s?.startTime || ''} 
                            onChange={e => handleUpdate(emp.id, ds, { startTime: e.target.value })} />
                        </td>
                      );
                    })}
                    <td rowSpan={7} className="border p-2 bg-blue-50 text-center font-bold text-blue-700 text-sm">
                      {monthlyTotal.toFixed(1)}h
                    </td>
                  </tr>
                  {/* 2. 下班時間 */}
                  <tr>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold">下班</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-0">
                          <input type="time" className="w-full p-1 bg-transparent outline-none focus:bg-green-50" value={s?.endTime || ''} 
                            onChange={e => handleUpdate(emp.id, ds, { endTime: e.target.value })} />
                        </td>
                      );
                    })}
                  </tr>
                  {/* 3. 休息時數 */}
                  <tr>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold">休息</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-0">
                          <input type="text" placeholder="0" className="w-full p-1 text-center bg-transparent outline-none focus:bg-green-50" value={s?.breakHours || ''} 
                            onChange={e => handleUpdate(emp.id, ds, { breakHours: e.target.value })} />
                        </td>
                      );
                    })}
                  </tr>
                  {/* 4. 每日工時 (自動) */}
                  <tr className="bg-green-50/30">
                    <td className="border p-1 font-bold sticky left-28 z-20 bg-green-50 text-green-700 text-[10px]">工時</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-1 text-center font-bold text-green-600">
                          {s?.workHours && s.workHours > 0 ? s.workHours.toFixed(1) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  {/* 5. 餐期站位 */}
                  <tr>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold">餐期</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-0 text-center font-bold">
                          <select className={`w-full p-1 outline-none text-center ${s?.station === '休' ? 'text-red-500 bg-red-50' : ''}`} value={s?.station || ''}
                            onChange={e => handleUpdate(emp.id, ds, { station: e.target.value as StationType })}>
                            <option value="">-</option>
                            <option value="MT">MT</option><option value="OT">OT</option><option value="CT">CT</option><option value="休">休</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                  {/* 6. 備餐/備料 */}
                  <tr>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold">備餐</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-0">
                          <select className="w-full p-1 outline-none text-center text-gray-600" value={s?.prepStation || ''}
                            onChange={e => handleUpdate(emp.id, ds, { prepStation: e.target.value as PrepStationType })}>
                            <option value="">-</option>
                            <option value="切菜區">切菜</option><option value="烤箱區">烤箱</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                  {/* 7. 備註 */}
                  <tr>
                    <td className="border p-1 bg-gray-50 sticky left-28 z-20 text-[10px] font-bold text-gray-400">備註</td>
                    {days.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const s = dailySchedules.find(x => x.employeeId === emp.id && x.date === ds);
                      return (
                        <td key={ds} className="border p-0">
                          <input type="text" className="w-full p-1 text-[10px] bg-transparent outline-none italic text-gray-500" value={s?.note || ''} 
                            onChange={e => handleUpdate(emp.id, ds, { note: e.target.value })} />
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}

            {/* --- 底部統計列 --- */}
            
            {/* 實際人力時數 vs 預估目標 */}
            <tr className="bg-gray-100 font-bold border-t-4 border-gray-500">
              <td colSpan={2} className="p-2 sticky left-0 z-20 bg-gray-200 shadow-md">當日人力總時數</td>
              {days.map(d => {
                const ds = format(d, 'yyyy-MM-dd');
                const actual = dailySchedules.filter(s => s.date === ds).reduce((acc, curr) => acc + (curr.workHours || 0), 0);
                const target = dailyTargets.find(t => t.date === ds)?.targetHours || 0;
                const diff = actual - target;
                
                let statusColor = 'bg-green-100 text-green-700'; // 正常
                if (diff > 2) statusColor = 'bg-red-100 text-red-700'; // 超過過多
                if (diff < -2) statusColor = 'bg-yellow-100 text-yellow-700'; // 人力不足

                return (
                  <td key={ds} className={`border p-2 text-center ${statusColor}`}>
                    <div className="text-sm">{actual.toFixed(1)}</div>
                    <div className="text-[9px] font-normal opacity-80">
                      {target > 0 ? `對比目標: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}` : '未設目標'}
                    </div>
                  </td>
                );
              })}
              <td className="bg-gray-200"></td>
            </tr>

            {/* 餐期人力檢查指標 */}
            <tr className="bg-white">
              <td colSpan={2} className="p-2 sticky left-0 z-20 bg-gray-50 text-[10px] border-b-2">餐期覆蓋檢查</td>
              {days.map(d => {
                const ds = format(d, 'yyyy-MM-dd');
                const coverage = checkMealCoverage(ds);
                const isOk = coverage.MT && coverage.OT && coverage.CT;
                
                return (
                  <td key={ds} className="border p-1 text-center group relative">
                    {isOk ? (
                      <CheckCircle2 className="text-green-500 mx-auto" size={18}/>
                    ) : (
                      <div className="flex flex-col items-center text-[8px] text-red-500 font-bold leading-tight">
                        <AlertTriangle size={14} className="mb-0.5" />
                        {!coverage.MT && <span>缺MT</span>}
                        {!coverage.OT && <span>缺OT</span>}
                        {!coverage.CT && <span>缺CT</span>}
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="bg-gray-50"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
