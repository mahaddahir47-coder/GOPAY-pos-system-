export type ProductCategory = 'starters' | 'mains' | 'sides' | 'desserts' | 'beverages' | 'custom';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  iconName: string; // Dynamic Lucide Icon mapping
  colorClass: string; // Tailwind bg color class
  imageUrl?: string; // Optional image URL for beautiful visual menus
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number; // Used for custom-entered amount items
}

export type GoPayWallet = 'evc' | 'edahab' | 'jeeb' | 'premier';

export interface MerchantSettings {
  merchantName: string;
  merchantId: string;
  taxRate: number; // in percentage e.g. 5 for 5%
  defaultWallet: GoPayWallet;
}

export interface Invoice {
  id: string; // unique transaction session ID
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  merchantName: string;
  merchantId: string;
  wallet: GoPayWallet;
  timestamp: string;
  nfcPayload: string; // The JSON string formatted exactly as required
}

export type NFCStatus = 'idle' | 'ready' | 'success' | 'failure';

// Screen management
export type TabID = 'dashboard' | 'orders' | 'menu' | 'tables' | 'customers' | 'reports' | 'discounts' | 'admin';

// Orders Data Interface
export type OrderType = 'Dine In' | 'Takeaway' | 'Delivery';
export type OrderStatus = 'Serving' | 'Ready' | 'Preparing' | 'Completed' | 'Cancelled';

export interface Order {
  id: string; // e.g. "1045"
  type: OrderType;
  target: string; // E.g., "T-07" or "Walk-in Customer" or "John D."
  itemsCount: number;
  total: number;
  status: OrderStatus;
  timestamp: string; // ISO string
  walletUsed?: GoPayWallet;
}

// Tables Data Interface
export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';

export interface Table {
  id: string; // E.g. "T-01"
  seats: number;
  status: TableStatus;
  currentBill?: number;
  timeActiveStarted?: string; // ISO string when occupied
  reservedTime?: string; // E.g., "07:30 PM"
}

// Customers Data Interface
export interface Customer {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastVisit: string; // Date string E.g. "May 20, 2024"
}

// Discounts Data Interface
export type DiscountType = 'Percentage' | 'Amount' | 'BOGO';
export type DiscountStatus = 'Active' | 'Scheduled' | 'Expired';

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: string; // E.g. "10%" or "$5.00" or "-"
  usageCount: number;
  limit: string; // E.g. "∞" or "100"
  status: DiscountStatus;
  startDate?: string; // E.g. "May 24, 2024"
}

// Cashier login & permission profile
export interface Cashier {
  id: string;
  username: string;
  password?: string;
  shiftCode: string;
  permissions: Record<TabID, boolean>;
}

export interface ShiftLog {
  id: string;
  cashierId: string;
  cashierName: string;
  shiftCode: string;
  clockInTime: string;
  clockOutTime?: string;
  duration?: string; // string representing time under active clock-in e.g. "03h 45m"
}


