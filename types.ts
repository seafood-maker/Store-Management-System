/**
 * BistroFlow 系統類型定義檔案 - 完整整合版 (最新修正)
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
export interface Employee {
  id: string;
  storeId: string;
  name: string;
  role: Role;
  hourlyRate: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  account?: string;
  password?: string;
}

// --- 排班系統專用類型 ---
// 工作站類型：MT(外場主位), OT(外場次位), CT(櫃台), 休(休息), ''(未設定)
export type StationType = 'MT' | 'OT' | 'CT' | '休' | '';
// 備餐區類型
export type PrepStationType = '切菜區' | '烤箱區' | '';

// --- 班表與出勤 (整合自 DailySchedule) ---
export type Shift = {
  id: string;         // Firebase Doc ID (建議使用 employeeId_date 或是 隨機ID)
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
  breakHours: string;           // 修正：使用字串方便 UI 欄位輸入 (如 "0.5")
  workHours: number;            // 實際工時 (數字，用於薪資計算)
  
  // 備註與說明
  note: string;                 // 修正：依要求改為必填字串（若無內容則存空字串）
};

// --- 營收與目標 (Sales & Targets) ---
export interface DailyRevenue {
  id: string;
  storeId: string;
  date: string;       // YYYY-MM-DD
  amount: number;
}

// 每日營運目標
export interface DailyTarget {
  id?: string;
  storeId: string;    // 關聯分店
  date: string;       // YYYY-MM-DD (作為 key 使用)
  targetHours: number; // 目標工時
  revenue: number;     // 目標營業額
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
  date: string;       // YYYY-MM-DD
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
  targets: DailyTarget[];
}
