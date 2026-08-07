export type Store = {
  id: string;
  name: string;
};

export type Role = 'boss' | 'manager' | 'staff';

// 雇用類型定義
export type EmploymentType = 'full-time' | 'part-time';

// 新增：員工狀態定義（在職/凍結）
export type EmployeeStatus = 'active' | 'frozen';

export type Employee = {
  id: string;
  storeId: string;
  name: string;
  role: Role;
  hourlyRate: number;
  employmentType: EmploymentType;
  status: EmployeeStatus; // 新增這行：記錄員工目前是否啟用
  account?: string;
  password?: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'scheduled' | 'actual';
};

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

export type DailyRevenue = {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

export type ViewState = 'dashboard' | 'hr' | 'inventory' | 'sales';
