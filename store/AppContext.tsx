import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Store, Employee, Vendor, Material, DailyRevenue, Shift, InventoryTransaction, ViewState } from '../types';
import { mockStores, mockEmployees, mockVendors, mockMaterials, mockRevenue } from './mockData';

interface AppContextType {
  stores: Store[];
  selectedStoreId: string | 'all';
  setSelectedStoreId: (id: string | 'all') => void;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  
  // Auth
  isAuthenticated: boolean;
  currentUser: Employee | null;
  login: (account: string, pass: string) => boolean;
  logout: () => void;
  
  // Data
  employees: Employee[];
  shifts: Shift[];
  vendors: Vendor[];
  materials: Material[];
  transactions: InventoryTransaction[];
  revenues: DailyRevenue[];
  
  // Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  addTransaction: (tx: Omit<InventoryTransaction, 'id'>) => void;
  addRevenue: (rev: Omit<DailyRevenue, 'id'>) => void;
  saveDailyInbound: (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => void;
  saveInventoryCount: (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => void;
  updateMaterialErrorRate: (materialId: string, errorRate: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Store[]>(mockStores);
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [revenues, setRevenues] = useState<DailyRevenue[]>(mockRevenue);

  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    setEmployees([...employees, { ...emp, id: `emp-${Date.now()}` }]);
  };

  const addShift = (shift: Omit<Shift, 'id'>) => {
    setShifts([...shifts, { ...shift, id: `shift-${Date.now()}` }]);
  };

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    setVendors([...vendors, { ...vendor, id: `ven-${Date.now()}` }]);
  };

  const addMaterial = (material: Omit<Material, 'id'>) => {
    setMaterials([...materials, { ...material, id: `mat-${Date.now()}` }]);
  };

  const addTransaction = (tx: Omit<InventoryTransaction, 'id'>) => {
    setTransactions([...transactions, { ...tx, id: `tx-${Date.now()}` }]);
  };

  const addRevenue = (rev: Omit<DailyRevenue, 'id'>) => {
    // Check if revenue for this date and store already exists, if so update it
    const existingIndex = revenues.findIndex(r => r.storeId === rev.storeId && r.date === rev.date);
    if (existingIndex >= 0) {
      const newRevenues = [...revenues];
      newRevenues[existingIndex] = { ...newRevenues[existingIndex], amount: rev.amount };
      setRevenues(newRevenues);
    } else {
      setRevenues([...revenues, { ...rev, id: `rev-${Date.now()}` }]);
    }
  };

  const saveDailyInbound = (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => {
    // Remove existing inbound transactions for this date and store
    const filtered = transactions.filter(t => !(t.date === date && t.storeId === storeId && t.type === 'inbound'));
    
    // Add new ones
    const newTx = records.map((r, i) => ({
      ...r,
      id: `tx-inbound-${Date.now()}-${i}`,
      storeId,
      date,
      type: 'inbound' as const
    }));
    
    setTransactions([...filtered, ...newTx]);
  };

  const saveInventoryCount = (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => {
    // Remove existing count transactions for this date and store
    const filtered = transactions.filter(t => !(t.date === date && t.storeId === storeId && t.type === 'count'));
    
    // Add new ones
    const newTx = records.map((r, i) => ({
      ...r,
      id: `tx-count-${Date.now()}-${i}`,
      storeId,
      date,
      type: 'count' as const
    }));
    
    setTransactions([...filtered, ...newTx]);
  };

  const updateMaterialErrorRate = (materialId: string, errorRate: number) => {
    setMaterials(materials.map(m => m.id === materialId ? { ...m, acceptableErrorRate: errorRate } : m));
  };

  const login = (account: string, pass: string) => {
    const user = employees.find(e => e.account === account && e.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      if (user.role === 'boss') {
        setSelectedStoreId('all');
        setCurrentView('dashboard');
      } else if (user.role === 'manager') {
        setSelectedStoreId(user.storeId);
        setCurrentView('hr');
      } else {
        // staff
        setSelectedStoreId(user.storeId);
        setCurrentView('inventory');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        stores,
        selectedStoreId,
        setSelectedStoreId,
        currentView,
        setCurrentView,
        isAuthenticated,
        currentUser,
        login,
        logout,
        employees,
        shifts,
        vendors,
        materials,
        transactions,
        revenues,
        addEmployee,
        addShift,
        addVendor,
        addMaterial,
        addTransaction,
        addRevenue,
        saveDailyInbound,
        saveInventoryCount,
        updateMaterialErrorRate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
