/**
 * BistroFlow 系統類型定義檔案 - 完整整合版
 */

// --- 基礎定義 ---
export type Store = {
  id: string;
  name: string;
};

export type Role = 'boss' | 'manager' | 'staff';
export type EmploymentType = 'full-time' | 'part-time';
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

// --- 排班系統專用類型 (New) ---
// 工作站類型：MT(外場主位), OT(外場次位), CT(櫃台), 休(休息), ''(未設定)
export type StationType = 'MT' | 'OT' | 'CT' | '休' | '';
// 備餐區類型
export type PrepStationType = '切菜區' | '烤箱區' | '';

// --- 班表與出勤 (Merged & Updated) ---
export type Shift = {
  id: string;
  employeeId: string;
  storeId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  
  // 核心功能欄位
  type: 'scheduled' | 'actual'; // scheduled: 預排, actual: 實際出勤
  isLeave: boolean;             // 是否請假
  
  // 工作站資訊
  station: StationType;
  prepStation: PrepStationType;
  
  // 工時計算
  breakHours: number;           // 休息時數
  workHours: number;            // 實際工時 (自動計算結果：總時數 - 休息時數)
  
  // 備註與說明
  note?: string;
};

// --- 營收與目標 (Sales & Targets) ---
export type DailyRevenue = {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

// 每日營運目標 (New)
export interface DailyTarget {
  id?: string;      // 在 Firebase 中建議加上 id
  storeId: string;  // 新增：關聯分店
  date: string;     // YYYY-MM-DD
  targetHours: number; // 目標工時
  revenue: number;     // 目標營業額 (或實際對應之營業額預測)
}

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
  acceptableErrorRate?: number; 
};

export type InventoryTransaction = {
  id: string;
  storeId: string;
  materialId: string;
  date: string; // YYYY-MM-DD
  type: 'inbound' | 'usage' | 'count'; 
  quantity: number;
  price?: number;         
  actualVendor?: string;  
  reason?: string;        
  theoreticalQuantity?: number; 
};

// --- 導覽與資料結構 ---
export type ViewState = 'dashboard' | 'hr' | 'inventory' | 'sales';

export interface AppData {
  employees: Employee[];
  shifts: Shift[];
  vendors: Vendor[];
  materials: Material[];
  transactions: InventoryTransaction[];
  revenues: DailyRevenue[];
  targets: DailyTarget[]; // 新增：排班目標清單
}
