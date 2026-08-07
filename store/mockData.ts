import { Store, Employee, Vendor, Material, DailyRevenue, Shift, InventoryTransaction } from '../types';

export const mockStores: Store[] = [
  { id: 'store-1', name: '食見生活育德店' },
  { id: 'store-2', name: '食見生活大里店' },
];

export const mockEmployees: Employee[] = [
  { id: 'emp-boss', storeId: 'all', name: '老闆(我)', role: 'boss', hourlyRate: 0, account: 'boss', password: '123' },
  { id: 'emp-1', storeId: 'store-1', name: '育德店長', role: 'manager', hourlyRate: 250, account: 'manager1', password: '123' },
  { id: 'emp-2', storeId: 'store-1', name: '育德店員', role: 'staff', hourlyRate: 190, account: 'staff1', password: '123' },
  { id: 'emp-3', storeId: 'store-2', name: '大里店長', role: 'manager', hourlyRate: 250, account: 'manager2', password: '123' },
  { id: 'emp-4', storeId: 'store-2', name: '大里店員', role: 'staff', hourlyRate: 190, account: 'staff2', password: '123' },
];

export const mockVendors: Vendor[] = [
  { id: 'v-hq', name: '總部' },
  { id: 'v-msj', name: '米食家' },
  { id: 'v-ky', name: '凱燁' },
  { id: 'v-my', name: '銘洋' },
  { id: 'v-yx', name: '宥杏' },
  { id: 'v-other', name: '其他廠商' },
];

export const mockMaterials: Material[] = [
  // 總部
  { id: 'm-hq-1', vendorId: 'v-hq', name: '腰封', unit: '箱', currentPrice: 500 },
  { id: 'm-hq-2', vendorId: 'v-hq', name: '塑膠袋', unit: '袋', currentPrice: 150 },
  { id: 'm-hq-3', vendorId: 'v-hq', name: '貼紙', unit: '捆', currentPrice: 200 },
  { id: 'm-hq-4', vendorId: 'v-hq', name: '菜單', unit: '捆', currentPrice: 300 },
  { id: 'm-hq-5', vendorId: 'v-hq', name: '湯醬', unit: '箱', currentPrice: 800 },
  { id: 'm-hq-6', vendorId: 'v-hq', name: '昆布湯醬', unit: '箱', currentPrice: 850 },
  { id: 'm-hq-7', vendorId: 'v-hq', name: '堅果辣醬', unit: '箱', currentPrice: 900 },
  { id: 'm-hq-8', vendorId: 'v-hq', name: '柳丁汁', unit: '罐', currentPrice: 120 },
  { id: 'm-hq-9', vendorId: 'v-hq', name: '芭樂汁', unit: '罐', currentPrice: 120 },
  
  // 米食家
  { id: 'm-msj-1', vendorId: 'v-msj', name: '黑胡椒粒', unit: '包', currentPrice: 180 },
  { id: 'm-msj-2', vendorId: 'v-msj', name: '葵花油', unit: '桶', currentPrice: 650 },
  { id: 'm-msj-3', vendorId: 'v-msj', name: '工研醋', unit: '罐', currentPrice: 90 },
  { id: 'm-msj-4', vendorId: 'v-msj', name: '奶油', unit: '塊', currentPrice: 110 },
  { id: 'm-msj-5', vendorId: 'v-msj', name: '鮮味高手', unit: '包', currentPrice: 140 },
  { id: 'm-msj-6', vendorId: 'v-msj', name: '米酒', unit: '箱', currentPrice: 600 },
  { id: 'm-msj-7', vendorId: 'v-msj', name: '海帶苗', unit: '包', currentPrice: 200 },
  { id: 'm-msj-8', vendorId: 'v-msj', name: '小磨坊洋香菜葉', unit: '包', currentPrice: 250 },
  { id: 'm-msj-9', vendorId: 'v-msj', name: '廟口小吃品牌椒鹽粉', unit: '包', currentPrice: 180 },
  { id: 'm-msj-10', vendorId: 'v-msj', name: '熟黑芝麻粒', unit: '包', currentPrice: 150 },
  { id: 'm-msj-11', vendorId: 'v-msj', name: '大漠孜然', unit: '箱', currentPrice: 1200 },
  { id: 'm-msj-12', vendorId: 'v-msj', name: '鹽', unit: '袋', currentPrice: 50 },
  { id: 'm-msj-13', vendorId: 'v-msj', name: 'HK-236餐盒', unit: '箱', currentPrice: 850 },
  { id: 'm-msj-14', vendorId: 'v-msj', name: '點心盒', unit: '箱', currentPrice: 700 },
  { id: 'm-msj-15', vendorId: 'v-msj', name: '湯杯', unit: '箱', currentPrice: 600 },
  { id: 'm-msj-16', vendorId: 'v-msj', name: '湯杯蓋', unit: '箱', currentPrice: 450 },
  { id: 'm-msj-17', vendorId: 'v-msj', name: '白色吐司盒(無扣)', unit: '箱', currentPrice: 900 },
  { id: 'm-msj-18', vendorId: 'v-msj', name: '白色一體大(無扣)', unit: '箱', currentPrice: 1100 },
  { id: 'm-msj-19', vendorId: 'v-msj', name: '1oz醬料盒', unit: '串', currentPrice: 150 },
  { id: 'm-msj-20', vendorId: 'v-msj', name: '筷子', unit: '箱', currentPrice: 500 },
  { id: 'm-msj-21', vendorId: 'v-msj', name: '免洗湯匙', unit: '箱', currentPrice: 450 },
  { id: 'm-msj-22', vendorId: 'v-msj', name: '橡皮筋', unit: '包', currentPrice: 80 },
  { id: 'm-msj-23', vendorId: 'v-msj', name: '漂白水(3.6L)-(4罐)麗質', unit: '箱', currentPrice: 350 },
  { id: 'm-msj-24', vendorId: 'v-msj', name: '洗碗精', unit: '箱', currentPrice: 400 },
  { id: 'm-msj-25', vendorId: 'v-msj', name: '7斤花袋', unit: '包', currentPrice: 120 },
  { id: 'm-msj-26', vendorId: 'v-msj', name: '5斤花袋', unit: '包', currentPrice: 100 },
  { id: 'm-msj-27', vendorId: 'v-msj', name: '黑色垃圾袋', unit: '包', currentPrice: 180 },
  { id: 'm-msj-28', vendorId: 'v-msj', name: '百利菜瓜布', unit: '包', currentPrice: 220 },

  // 凱燁
  { id: 'm-ky-1', vendorId: 'v-ky', name: '雞腿排', unit: '箱', currentPrice: 1800 },
  { id: 'm-ky-2', vendorId: 'v-ky', name: '雞絲', unit: '箱', currentPrice: 1500 },
  { id: 'm-ky-3', vendorId: 'v-ky', name: '雞翅', unit: '箱', currentPrice: 1200 },
  { id: 'm-ky-4', vendorId: 'v-ky', name: '松阪豬', unit: '箱', currentPrice: 2500 },

  // 銘洋
  { id: 'm-my-1', vendorId: 'v-my', name: '鮭魚', unit: '箱', currentPrice: 3200 },
  { id: 'm-my-2', vendorId: 'v-my', name: '鱸魚', unit: '箱', currentPrice: 2100 },
  { id: 'm-my-3', vendorId: 'v-my', name: '魚卵', unit: '箱', currentPrice: 2800 },
  { id: 'm-my-4', vendorId: 'v-my', name: '白蝦', unit: '10盒', currentPrice: 1500 },
  { id: 'm-my-5', vendorId: 'v-my', name: '豬里肌', unit: '箱', currentPrice: 1800 },

  // 宥杏
  { id: 'm-yx-1', vendorId: 'v-yx', name: '菜', unit: '斤', currentPrice: 50 },

  // 其他廠商
  { id: 'm-ot-1', vendorId: 'v-other', name: '雞胸肉', unit: '10斤', currentPrice: 850 },
  { id: 'm-ot-2', vendorId: 'v-other', name: '骰子牛', unit: '15斤', currentPrice: 3800 },
  { id: 'm-ot-3', vendorId: 'v-other', name: '黃金泡菜', unit: '包', currentPrice: 180 },
  { id: 'm-ot-4', vendorId: 'v-other', name: '韓式泡菜', unit: '罐', currentPrice: 200 },
  { id: 'm-ot-5', vendorId: 'v-other', name: '濾水器濾心', unit: '組', currentPrice: 1200 },
  { id: 'm-ot-6', vendorId: 'v-other', name: '真空袋(130*210)', unit: '箱', currentPrice: 650 },
  { id: 'm-ot-7', vendorId: 'v-other', name: '蛋', unit: '箱', currentPrice: 800 },
];

// Generate some mock revenue for the last 7 days
const today = new Date();
export const mockRevenue: DailyRevenue[] = [];
for (let i = 6; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];
  
  mockRevenue.push({
    id: `rev-1-${i}`,
    storeId: 'store-1',
    date: dateStr,
    amount: Math.floor(Math.random() * 15000) + 20000
  });
  
  mockRevenue.push({
    id: `rev-2-${i}`,
    storeId: 'store-2',
    date: dateStr,
    amount: Math.floor(Math.random() * 20000) + 18000
  });
}
