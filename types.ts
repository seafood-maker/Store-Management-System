/**
 * BistroFlow 系統類型定義檔案
 */

// --- 基礎定義 ---
export type Store = {
  id: string;
  name: string;
};

export type Role = 'boss' | 'manager' | 'staff';

// 雇用類型：全職 / 兼職
export type EmploymentType = 'full-time' | 'part-time';

// 員工狀態：在職 / 凍結（離職或停權）
export type EmployeeStatus = 'active' | 'frozen';

// --- 人事管理 (HR) ---
export type Employee = {
  id: string;
  storeId: string;
  name: string;
  role: Role;
  hourlyRate: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  account?: string;
  password?: string;
};

// 班表定義：合併了類型(scheduled/actual)與備註(note)
export type Shift = {
  id: string;
  employeeId: string;
  storeId: string;
  date: string;       // 格式：YYYY-MM-DD
  startTime: string;  // 格式：HH:mm
  endTime: string;    // 格式：HH:mm
  type: 'scheduled' | 'actual'; // scheduled: 預排班表, actual: 實際出勤
  note?: string;      // 新增：班表備註（例如：請假原因、特殊交辦事項）
};

// --- 物料與供應商 (Inventory) ---
export type Vendor = {
  id: string;
  name: string;
};

export type Material = {
  id: string;
  vendorId: string;
  name: string;
  unit: string;
  currentPrice: number;
  acceptableErrorRate?: number; // 可接受損耗率
};

// 庫存異動紀錄
export type InventoryTransaction = {
  id: string;
  storeId: string;
  materialId: string;
  date: string; // YYYY-MM-DD
  type: 'inbound' | 'usage' | 'count'; // inbound: 進貨, usage: 消耗, count: 盤點
  quantity: number;
  price?: number;         // 進貨時的單價
  actualVendor?: string;  // 實際進貨供應商（有時會換人買）
  reason?: string;        // 異動原因（例如：報廢、銷售消耗）
  theoreticalQuantity?: number; // 盤點時系統計算的理論數量
};

// --- 營收 (Sales) ---
export type DailyRevenue = {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

// --- 導覽狀態 ---
export type ViewState = 'dashboard' | 'hr' | 'inventory' | 'sales';
