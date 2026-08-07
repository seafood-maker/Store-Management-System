export type Store = {
  id: string;
  name: string;
};

export type Role = 'boss' | 'manager' | 'staff';

// 新增：雇用類型定義
export type EmploymentType = 'full-time' | 'part-time';

export type Employee = {
  id: string;
  storeId: string;
  name: string;
  role: Role;
  hourlyRate: number;
  employmentType: EmploymentType; // 新增這行
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
