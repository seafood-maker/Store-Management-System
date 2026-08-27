import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  parse, differenceInMinutes, isSameDay, getDay 
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export function SmartSchedule() {
  const { employees, stores, selectedStoreId, dailySchedules, dailyTargets, updateDailySchedule, updateDailyTarget } = useAppContext();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate]);

  // --- 工具函數：計算工時 ---
  const calculateHours = (start: string, end: string, breakH: number) => {
    if (!start || !end) return 0;
    const s = parse(start, 'HH:mm', new Date());
    const e = parse(end, 'HH:mm', new Date());
    let diff = differenceInMinutes(e, s) / 60;
    if (diff < 0) diff += 24; // 跨日處理
    return Math.max(0, diff - breakH);
  };

  // --- 工具函數：檢查餐期 (11:00-13:00) ---
  const checkMealStation = (dateStr: string) => {
    const dayShifts = dailySchedules.filter(s => s.date === dateStr);
    const coverage = { MT: false, OT: false, CT: false };
    
    dayShifts.forEach(s => {
      if (s.isLeave) return;
      // 檢查時間是否有涵蓋 11:00 - 13:00
      const isAvailable = s.startTime <= "11:00" && s.endTime >= "13:00";
      if (isAvailable && s.station in coverage) {
        coverage[s.station as keyof typeof coverage] = true;
      }
    });
    return coverage;
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
      {/* 1. 年月選擇器 */}
      <div className="bg-green-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft/></button>
            {format(currentDate, 'yyyy年 MM月')}
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight/></button>
          </h2>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">智慧檢查模式已開啟</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-30 bg-gray-100 shadow-sm">
            {/* 星期行 */}
            <tr>
              <th className="border p-2 bg-gray-200 sticky left-0 z-40" colSpan={2}>星期</th>
              {days.map(day => (
                <th key={day.toString()} className={`border p-2 min-w-[80px] ${[0, 6].includes(getDay(day)) ? 'bg-orange-50 text-orange-600' : ''}`}>
                  {format(day, 'EEE', { locale: zhTW })}
                </th>
              ))}
            </tr>
            {/* 日期行 */}
            <tr>
              <th className="border p-2 bg-gray-200 sticky left-0 z-40" colSpan={2}>日期</th>
              {days.map(day => (
                <th key={day.toString()} className={`border p-2 ${[0, 6].includes(getDay(day)) ? 'bg-orange-100' : ''}`}>
                  {format(day, 'd')}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* 2. 員工排班區 */}
            {employees.filter(e => e.status !== 'frozen').map(emp => (
              <React.Fragment key={emp.id}>
                <tr className="border-t-2 border-gray-300">
                  <td rowSpan={7} className="border p-2 bg-gray-50 font-bold text-center w-24 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    {emp.name}
                  </td>
                  <td className="border p-1 bg-gray-50 w-20 text-xs font-medium sticky left-24 z-20">上班時間</td>
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const sched = dailySchedules.find(s => s.employeeId === emp.id && s.date === dateStr);
                    return (
                      <td key={dateStr} className="border p-0">
                        <input 
                          type="time" 
                          className={`w-full p-1 outline-none ${sched?.isLeave ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                          value={sched?.startTime || ''}
                          disabled={sched?.isLeave}
                          onChange={(e) => {
                            const start = e.target.value;
                            const end = sched?.endTime || '';
                            const bh = sched?.breakHours || 0;
                            updateDailySchedule({
                              employeeId: emp.id, date: dateStr,
                              startTime: start, endTime: end, breakHours: bh,
                              workHours: calculateHours(start, end, bh),
                              station: sched?.station || '', prepStation: sched?.prepStation || '',
                              note: sched?.note || '', isLeave: false
                            });
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
                {/* 下班、休息、時數、工作站等其餘 6 行... (結構與上班時間類似) */}
                <tr className="bg-white">
                  <td className="border p-1 bg-gray-50 text-xs font-medium sticky left-24 z-20">下班時間</td>
                  {days.map(day => ( <td key={day.toString()} className="border p-0"> {/* 下班 input */} </td> ))}
                </tr>
                <tr className="bg-gray-50/30 font-bold">
                  <td className="border p-1 bg-gray-100 text-xs font-bold sticky left-24 z-20">工時</td>
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const sched = dailySchedules.find(s => s.employeeId === emp.id && s.date === dateStr);
                    return (
                      <td key={dateStr} className={`border p-1 text-center ${sched?.workHours && sched.workHours > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                        {sched?.workHours || 0}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border p-1 bg-gray-50 text-xs font-medium sticky left-24 z-20">餐期工作站</td>
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const sched = dailySchedules.find(s => s.employeeId === emp.id && s.date === dateStr);
                    return (
                      <td key={dateStr} className="border p-0">
                        <select 
                          className={`w-full p-1 outline-none font-bold ${sched?.station === '休' ? 'text-red-500 bg-red-50' : ''}`}
                          value={sched?.station || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDailySchedule({
                              ...sched!,
                              employeeId: emp.id, date: dateStr,
                              station: val as any,
                              isLeave: val === '休',
                              workHours: val === '休' ? 0 : (sched?.workHours || 0)
                            });
                          }}
                        >
                          <option value="">選取</option>
                          <option value="MT">MT</option>
                          <option value="OT">OT</option>
                          <option value="CT">CT</option>
                          <option value="休">休</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
                {/* 備料工作站與其他列... */}
              </React.Fragment>
            ))}

            {/* 3. 每日統計區 (底部) */}
            <tr className="bg-gray-100 font-bold border-t-4 border-gray-400">
              <td colSpan={2} className="border p-2 sticky left-0 z-20 bg-gray-200">實際人力總時數</td>
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const target = dailyTargets.find(t => t.date === dateStr)?.targetHours || 0;
                const actual = dailySchedules.filter(s => s.date === dateStr).reduce((acc, curr) => acc + (curr.workHours || 0), 0);
                const diff = actual - target;
                
                let bgColor = 'bg-green-100 text-green-700'; // 剛好
                if (diff > 0) bgColor = 'bg-red-100 text-red-700'; // 超過
                if (diff < 0) bgColor = 'bg-yellow-100 text-yellow-700'; // 不足

                return (
                  <td key={dateStr} className={`border p-2 text-center ${bgColor}`}>
                    {actual} <span className="text-[10px]">({diff > 0 ? '+' : ''}{diff})</span>
                  </td>
                );
              })}
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={2} className="border p-2 sticky left-0 z-20 bg-gray-100 text-xs">餐期人力檢查</td>
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const coverage = checkMealStation(dateStr);
                const allOk = coverage.MT && coverage.OT && coverage.CT;
                return (
                  <td key={dateStr} className="border p-1 text-center">
                    {allOk ? (
                      <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center text-[9px] text-red-500 font-bold">
                        <AlertCircle size={14} />
                        {!coverage.MT && <span>缺MT</span>}
                        {!coverage.OT && <span>缺OT</span>}
                        {!coverage.CT && <span>缺CT</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
