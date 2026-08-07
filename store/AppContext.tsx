import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  setDoc 
} from 'firebase/firestore';
import { 
  Store, Employee, Vendor, Material, DailyRevenue, 
  Shift, InventoryTransaction, ViewState 
} from '../types';

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
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
  addMaterial: (material: Omit<Material, 'id'>) => Promise<void>;
  addTransaction: (tx: Omit<InventoryTransaction, 'id'>) => Promise<void>;
  addRevenue: (rev: Omit<DailyRevenue, 'id'>) => Promise<void>;
  saveDailyInbound: (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => Promise<void>;
  saveInventoryCount: (date: string, storeId: string, records: Omit<InventoryTransaction, 'id' | 'storeId' | 'date' | 'type'>[]) => Promise<void>;
  updateMaterialErrorRate: (materialId: string, errorRate: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // UI 狀態
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // Firebase 資料狀態
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [revenues, setRevenues] = useState<DailyRevenue[]>([]);

  // --- 1. 建立 Firebase 即時監聽 ---
  useEffect(() => {
    const unsubStores = onSnapshot(collection(db, 'stores'), (snap) => {
      setStores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store)));
    });
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });
    const unsubShifts = onSnapshot(collection(db, 'shifts'), (snap) => {
      setShifts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift)));
    });
    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snap) => {
      setVendors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor)));
    });
    const unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
    });
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryTransaction)));
    });
    const unsubRevenues = onSnapshot(collection(db, 'revenues'), (snap) => {
      setRevenues(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRevenue)));
    });

    return () => {
      unsubStores(); unsubEmployees(); unsubShifts();
      unsubVendors(); unsubMaterials(); unsubTransactions(); unsubRevenues();
    };
  }, []);

  // --- 2. 寫入 Actions (Firebase 版) ---

  const addEmployee = async (emp: Omit<Employee, 'id'>) => {
    await addDoc(collection(db, 'employees'), emp);
  };

  const addShift = async (shift: Omit<Shift, 'id'>) => {
    await addDoc(collection(db, 'shifts'), shift);
  };

  const addVendor = async (vendor: Omit<Vendor, 'id'>) => {
    await addDoc(collection(db, 'vendors'), vendor);
  };

  const addMaterial = async (material: Omit<Material, 'id'>) => {
    await addDoc(collection(db, 'materials'), material);
  };

  const addTransaction = async (tx: Omit<InventoryTransaction, 'id'>) => {
    await addDoc(collection(db, 'transactions'), tx);
  };

  const addRevenue = async (rev: Omit<DailyRevenue, 'id'>) => {
    // 檢查是否已有該店該日期的資料，若有則更新，若無則新增 (Upsert)
    const q = query(collection(db, 'revenues'), 
      where('storeId', '==', rev.storeId), 
      where('date', '==', rev.date)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'revenues', querySnapshot.docs[0].id);
      await updateDoc(docRef, { amount: rev.amount });
    } else {
      await addDoc(collection(db, 'revenues'), rev);
    }
  };

  const saveDailyInbound = async (date: string, storeId: string, records: any[]) => {
    // 為了保持資料乾淨，先查詢當天已有的 inbound 紀錄並刪除，再新增
    const q = query(collection(db, 'transactions'), 
      where('date', '==', date), 
      where('storeId', '==', storeId), 
      where('type', '==', 'inbound')
    );
    const existing = await getDocs(q);
    for (const d of existing.docs) {
      await deleteDoc(doc(db, 'transactions', d.id));
    }

    // 批量新增新紀錄
    for (const record of records) {
      await addDoc(collection(db, 'transactions'), {
        ...record,
        storeId,
        date,
        type: 'inbound',
        timestamp: new Date()
      });
    }
  };

  const saveInventoryCount = async (date: string, storeId: string, records: any[]) => {
    const q = query(collection(db, 'transactions'), 
      where('date', '==', date), 
      where('storeId', '==', storeId), 
      where('type', '==', 'count')
    );
    const existing = await getDocs(q);
    for (const d of existing.docs) {
      await deleteDoc(doc(db, 'transactions', d.id));
    }

    for (const record of records) {
      await addDoc(collection(db, 'transactions'), {
        ...record,
        storeId,
        date,
        type: 'count',
        timestamp: new Date()
      });
    }
  };

  const updateMaterialErrorRate = async (materialId: string, errorRate: number) => {
    const docRef = doc(db, 'materials', materialId);
    await updateDoc(docRef, { acceptableErrorRate: errorRate });
  };

  // --- 3. Auth 邏輯 (基於 Firebase 抓回來的員工資料) ---

  const login = (account: string, pass: string) => {
    const user = employees.find(e => e.account === account && e.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      if (user.role === 'boss') {
        setSelectedStoreId('all');
        setCurrentView('dashboard');
      } else {
        setSelectedStoreId(user.storeId);
        setCurrentView(user.role === 'manager' ? 'hr' : 'inventory');
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
