import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BentoCatalog } from './components/BentoCatalog';
import { BasketPanel } from './components/BasketPanel';
import { NFCInducer } from './components/NFCInducer';
import { CheckoutStage } from './components/CheckoutStage';
import { CustomerWalletSimulator } from './components/CustomerWalletSimulator';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { TablesView } from './components/TablesView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { DiscountsView } from './components/DiscountsView';
import { LoginView } from './components/LoginView';
import { AdminView } from './components/AdminView';
import { MerchantSettings, CartItem, GoPayWallet, Invoice, Product, TabID, Order, Table, Customer, Discount, OrderStatus, TableStatus, Cashier, ShiftLog } from './types';
import { Sparkles, ShieldAlert, Printer, CheckCircle, RefreshCw, X, ShoppingBag, Smartphone } from 'lucide-react';
import { printReceiptViaBrowser, ThermalPrinterDevice } from './utils/printer';

const DEFAULT_SETTINGS: MerchantSettings = {
  merchantName: 'GoPay Restaurant',
  merchantId: 'R-10245',
  taxRate: 10.0,
  defaultWallet: 'evc',
};

export default function App() {
  // --- STATE INITIALIZATION ---
  const [settings, setSettings] = useState<MerchantSettings>(() => {
    try {
      const saved = localStorage.getItem('gopay_merchant_settings2');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [cashiers, setCashiers] = useState<Cashier[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_cashiers_list');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'c-1',
        username: 'Mohamed Aidid',
        password: '123',
        shiftCode: 'Shift #A102',
        permissions: {
          dashboard: true,
          orders: true,
          menu: true,
          tables: true,
          customers: true,
          reports: true,
          discounts: true,
          admin: true
        }
      },
      {
        id: 'c-2',
        username: 'Amina Barre',
        password: '456',
        shiftCode: 'Shift #B305',
        permissions: {
          dashboard: true,
          orders: true,
          menu: true,
          tables: true,
          customers: false,
          reports: false,
          discounts: false,
          admin: false
        }
      }
    ];
  });

  const [activeCashierId, setActiveCashierId] = useState<string>(() => {
    return localStorage.getItem('gopay_active_cashier_id') || 'c-1';
  });

  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('gopay_admin_user') || 'admin';
  });

  const [adminPass, setAdminPass] = useState<string>(() => {
    return localStorage.getItem('gopay_admin_pass') || 'admin';
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('gopay_cashiers_list', JSON.stringify(cashiers));
  }, [cashiers]);

  useEffect(() => {
    localStorage.setItem('gopay_active_cashier_id', activeCashierId);
  }, [activeCashierId]);

  useEffect(() => {
    localStorage.setItem('gopay_admin_user', adminUser);
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem('gopay_admin_pass', adminPass);
  }, [adminPass]);

  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_shift_logs_index');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 's-1',
        cashierId: 'c-1',
        cashierName: 'Mohamed Aidid',
        shiftCode: 'Shift #S540',
        clockInTime: new Date(Date.now() - 24 * 3600 * 1000 - 8 * 3600 * 1000).toISOString(),
        clockOutTime: new Date(Date.now() - 24 * 3600 * 1050).toISOString(),
        duration: '08h 00m 00s'
      },
      {
        id: 's-2',
        cashierId: 'c-2',
        cashierName: 'Amina Barre',
        shiftCode: 'Shift #S234',
        clockInTime: new Date(Date.now() - 12 * 3600 * 1000 - 4 * 3600 * 1000).toISOString(),
        clockOutTime: new Date(Date.now() - 12 * 3600 * 1050).toISOString(),
        duration: '04h 00m 00s'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gopay_shift_logs_index', JSON.stringify(shiftLogs));
  }, [shiftLogs]);

  const handleClockIn = (cashierId: string, shiftCode: string) => {
    const cashier = cashiers.find(c => c.id === cashierId) || cashiers[0];
    const newLog: ShiftLog = {
      id: `s-${Date.now()}`,
      cashierId,
      cashierName: cashier?.username || 'Cashier',
      shiftCode,
      clockInTime: new Date().toISOString()
    };
    setShiftLogs(prev => [...prev, newLog]);
    setCashiers(prev => prev.map(c => c.id === cashierId ? { ...c, shiftCode } : c));
  };

  const handleClockOut = (cashierId: string, durationStr: string) => {
    setShiftLogs(prev => prev.map(log => {
      if (log.cashierId === cashierId && !log.clockOutTime) {
        return {
          ...log,
          clockOutTime: new Date().toISOString(),
          duration: durationStr || '00h 01m 24s'
        };
      }
      return log;
    }));
  };

  const handleDeleteShiftLog = (id: string) => {
    setShiftLogs(prev => prev.filter(log => log.id !== id));
  };

  // Derived properties for active cashier
  const activeCashier = cashiers.find(c => c.id === activeCashierId) || cashiers[0];
  const cashierName = activeCashier?.username || 'Cashier';
  const shiftCode = activeCashier?.shiftCode || 'Shift #A102';


  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_cart_items2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedWallet, setSelectedWallet] = useState<GoPayWallet>(() => {
    try {
      const saved = localStorage.getItem('gopay_selected_wallet2');
      if (saved && ['evc', 'edahab', 'jeeb', 'premier'].includes(saved)) {
        return saved as GoPayWallet;
      }
      return settings.defaultWallet;
    } catch {
      return settings.defaultWallet;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isInlineSimOpen, setIsInlineSimOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- MULTI-SCREEN NAVIGATION ---
  const [activeTab, setActiveTab] = useState<TabID>('dashboard');
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // --- CURRENT TRANSACTION PARAMETERS ---
  const [orderType, setOrderType] = useState<'Dine In' | 'Takeaway' | 'Delivery'>('Dine In');
  const [selectedTableId, setSelectedTableId] = useState<string>('T-07');
  const [takeawayTime, setTakeawayTime] = useState<string>('Immediate');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryPhone, setDeliveryPhone] = useState<string>('');

  // --- MODEL INDICES ---
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_orders_index');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "1045", type: "Dine In", target: "T-07", itemsCount: 4, total: 43.45, status: "Serving", timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: "1044", type: "Takeaway", target: "Walk-in Customer", itemsCount: 2, total: 23.90, status: "Ready", timestamp: new Date(Date.now() - 480000).toISOString() },
      { id: "1043", type: "Dine In", target: "T-03", itemsCount: 3, total: 31.20, status: "Preparing", timestamp: new Date(Date.now() - 720000).toISOString() },
      { id: "1042", type: "Delivery", target: "John D.", itemsCount: 5, total: 67.80, status: "Preparing", timestamp: new Date(Date.now() - 1080000).toISOString() },
      { id: "1041", type: "Dine In", target: "T-12", itemsCount: 2, total: 18.50, status: "Serving", timestamp: new Date(Date.now() - 1440000).toISOString() },
      { id: "1040", type: "Takeaway", target: "Walk-in Customer", itemsCount: 3, total: 29.75, status: "Completed", timestamp: new Date(Date.now() - 1920000).toISOString() },
      { id: "1039", type: "Dine In", target: "T-01", itemsCount: 4, total: 41.90, status: "Completed", timestamp: new Date(Date.now() - 2700000).toISOString() },
      { id: "1038", type: "Delivery", target: "Sarah M.", itemsCount: 6, total: 89.60, status: "Completed", timestamp: new Date(Date.now() - 3600000).toISOString() }
    ];
  });

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_tables_index');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "T-01", seats: 2, status: "Occupied", currentBill: 41.90 },
      { id: "T-02", seats: 4, status: "Available" },
      { id: "T-03", seats: 4, status: "Occupied", currentBill: 31.20 },
      { id: "T-04", seats: 2, status: "Reserved", reservedTime: "07:30 PM" },
      { id: "T-05", seats: 4, status: "Available" },
      { id: "T-06", seats: 6, status: "Occupied", currentBill: 76.30 },
      { id: "T-07", seats: 4, status: "Occupied", currentBill: 43.45 },
      { id: "T-08", seats: 2, status: "Available" },
      { id: "T-09", seats: 4, status: "Available" },
      { id: "T-10", seats: 6, status: "Available" },
      { id: "T-11", seats: 2, status: "Occupied", currentBill: 22.10 },
      { id: "T-12", seats: 4, status: "Occupied", currentBill: 16.50 }
    ];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_customers_index');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "C-101", name: "John Doe", phone: "+1 555 987 6543", ordersCount: 24, totalSpent: 682.50, lastVisit: "May 20, 2024" },
      { id: "C-102", name: "Sarah Miller", phone: "+1 555 123 4567", ordersCount: 15, totalSpent: 412.30, lastVisit: "May 19, 2024" },
      { id: "C-103", name: "Michael Brown", phone: "+1 555 234 5678", ordersCount: 31, totalSpent: 965.80, lastVisit: "May 18, 2024" },
      { id: "C-104", name: "Emily Davis", phone: "+1 555 345 6789", ordersCount: 9, totalSpent: 238.90, lastVisit: "May 17, 2024" },
      { id: "C-105", name: "David Wilson", phone: "+1 555 456 7890", ordersCount: 18, totalSpent: 521.60, lastVisit: "May 16, 2024" },
      { id: "C-106", name: "Jessica Taylor", phone: "+1 555 567 8901", ordersCount: 27, totalSpent: 743.20, lastVisit: "May 15, 2024" },
      { id: "C-107", name: "Daniel Anderson", phone: "+1 555 678 9012", ordersCount: 12, totalSpent: 312.40, lastVisit: "May 14, 2024" },
      { id: "C-108", name: "Sophia Martinez", phone: "+1 555 789 0123", ordersCount: 20, totalSpent: 588.70, lastVisit: "May 13, 2024" }
    ];
  });

  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    try {
      const saved = localStorage.getItem('gopay_discounts_index');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "STU10", name: "Student 10% Off", type: "Percentage", value: "10%", usageCount: 35, limit: "∞", status: "Active" },
      { id: "LUN15", name: "Lunch Special", type: "Percentage", value: "15%", usageCount: 120, limit: "∞", status: "Active" },
      { id: "WKD20", name: "Weekend Deal", type: "Percentage", value: "20%", usageCount: 56, limit: "∞", status: "Active" },
      { id: "BOGO1", name: "Buy 1 Get 1", type: "BOGO", value: "—", usageCount: 18, limit: "∞", status: "Active" },
      { id: "NEW05", name: "New Customer 5 Off", type: "Amount", value: "$5.00", usageCount: 23, limit: "∞", status: "Active" },
      { id: "HPH25", name: "Happy Hour Drinks", type: "Percentage", value: "25%", usageCount: 0, limit: "—", status: "Scheduled", startDate: "May 24, 2024" },
      { id: "RAM30", name: "Ramadan Special", type: "Percentage", value: "30%", usageCount: 0, limit: "—", status: "Scheduled", startDate: "Jun 1, 2024" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gopay_orders_index', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gopay_tables_index', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('gopay_customers_index', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('gopay_discounts_index', JSON.stringify(discounts));
  }, [discounts]);
  
  // --- PAYMENT SYNCS ---
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>('unpaid');
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>('');

  // --- THERMAL PRINTER STATES ---
  const [isPrinterConnected, setIsPrinterConnected] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gopay_printer_connected');
      return saved ? JSON.parse(saved) : true;
    } catch {}
    return true;
  });

  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gopay_auto_print');
      return saved ? JSON.parse(saved) : true;
    } catch {}
    return true;
  });

  const [connectedDevice, setConnectedDevice] = useState<ThermalPrinterDevice | null>(() => {
    return {
      name: 'Epson TM-T88VI (Virtual POS)',
      type: 'virtual',
      status: 'online'
    };
  });

  const [lastPrintedInvoiceId, setLastPrintedInvoiceId] = useState<string>('');
  const [showAnimatedReceiptRoll, setShowAnimatedReceiptRoll] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('gopay_printer_connected', JSON.stringify(isPrinterConnected));
  }, [isPrinterConnected]);

  useEffect(() => {
    localStorage.setItem('gopay_auto_print', JSON.stringify(autoPrintEnabled));
  }, [autoPrintEnabled]);

  // Master manual printer trigger
  const handleTriggerPrint = () => {
    if (cart.length === 0) return;
    printReceiptViaBrowser();
    
    // Toggle on-screen paper slip rollout animation
    setShowAnimatedReceiptRoll(true);
    setLastPrintedInvoiceId(activeInvoiceId);
  };

  // Automatically trigger a print job for completed orders
  useEffect(() => {
    if (paymentStatus === 'paid' && activeInvoiceId && cart.length > 0) {
      if (isPrinterConnected && autoPrintEnabled && activeInvoiceId !== lastPrintedInvoiceId) {
        // short delay (1.2 seconds) so payment success display renders smoothly first
        const timer = setTimeout(() => {
          handleTriggerPrint();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [paymentStatus, activeInvoiceId, isPrinterConnected, autoPrintEnabled, lastPrintedInvoiceId, cart]);

  // --- CUSTOMER CHECKOUT DECODER ---
  const [isCheckoutView, setIsCheckoutView] = useState<boolean>(false);
  const [urlMerchantId, setUrlMerchantId] = useState<string | null>(null);
  const [checkoutParams, setCheckoutParams] = useState<{
    invoiceId: string;
    merchantName: string;
    merchantId: string;
    amount: string;
    wallet: GoPayWallet;
    items?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isParamCheckout = params.get('checkout') === 'true';
      const merchantIdParam = params.get('merchant');
      
      if (isParamCheckout) {
        setIsCheckoutView(true);
        setCheckoutParams({
          invoiceId: params.get('invoiceId') || 'INV-TEMP',
          merchantName: params.get('merchant') || 'GoPay Restaurant',
          merchantId: params.get('id') || 'R-10245',
          amount: params.get('amount') || '0.00',
          wallet: (params.get('wallet') as GoPayWallet) || 'evc',
          items: params.get('items') || undefined,
        });
      } else if (merchantIdParam) {
        setIsCheckoutView(true);
        setUrlMerchantId(merchantIdParam);
      }
    }
  }, []);

  // Poll server for terminal price updates if accessed via permanent merchant counter barcode QR
  useEffect(() => {
    if (typeof window !== 'undefined' && urlMerchantId) {
      const fetchTerminalPrice = async () => {
        try {
          const res = await fetch(`/api/get-terminal-price?merchant=${urlMerchantId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.session) {
              const session = data.session;
              setCheckoutParams({
                invoiceId: session.invoiceId,
                merchantName: session.merchantId === "738435" ? "Salaam Bank Branch A" : session.merchantId === "146136" ? "Mogadishu Mall POS-2" : `Merchant Profile (${session.merchantId})`,
                merchantId: session.merchantId,
                amount: String(session.amount),
                wallet: (session.provider || 'evc') as GoPayWallet,
                items: undefined,
              });
              
              if (session.status === 'paid') {
                setPaymentStatus('paid');
              }
            }
          }
        } catch (err) {
          console.warn('Failed to poll terminal price update: ', err);
        }
      };

      fetchTerminalPrice();
      const interval = setInterval(fetchTerminalPrice, 1500);
      return () => clearInterval(interval);
    }
  }, [urlMerchantId]);

  // Stabilize unique invoice identifier referencing cart modifications
  useEffect(() => {
    if (cart.length > 0) {
      setActiveInvoiceId(prev => prev || `INV-${Date.now()}`);
    } else {
      setActiveInvoiceId('');
      setIsCheckingOut(false);
    }
  }, [cart, selectedWallet]);

  // Reset payment indicator status whenever pricing items edit
  useEffect(() => {
    setPaymentStatus('unpaid');
  }, [cart, selectedWallet]);

  // Active sync loop checking remote wallet payments made via secondary tabs/scanned links
  useEffect(() => {
    if (typeof window !== 'undefined' && activeInvoiceId) {
      const checkStatus = async () => {
        // 1. Check local storage first (instant tabs trigger)
        const saved = localStorage.getItem(`gopay_payment_status_${activeInvoiceId}`);
        if (saved === 'paid') {
          setPaymentStatus('paid');
          return;
        }

        // 2. Poll ntfy.sh occasionally to synchronize with external device checkouts (e.g. customer phone scans QR)
        try {
          const res = await fetch(`https://ntfy.sh/gopay_payment_${activeInvoiceId}/json?poll=1`);
          if (res.ok) {
            const text = await res.text();
            if (text.includes('"message":"paid"') || text.includes('paid')) {
              setPaymentStatus('paid');
              localStorage.setItem(`gopay_payment_status_${activeInvoiceId}`, 'paid');
            }
          }
        } catch (err) {
          console.warn('Network pub/sub polling offline or delayed:', err);
        }
      };

      checkStatus();

      // 3. Setup real-time HTML5 Server-Sent Events (SSE) listener for instant ntfy.sh triggers across devices
      let sse: EventSource | null = null;
      try {
        sse = new EventSource(`https://ntfy.sh/gopay_payment_${activeInvoiceId}/sse`);
        sse.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && (data.message === 'paid' || data.event === 'message')) {
              setPaymentStatus('paid');
              localStorage.setItem(`gopay_payment_status_${activeInvoiceId}`, 'paid');
            }
          } catch (err) {
            console.error('SSE Message decode error:', err);
          }
        };
      } catch (err) {
        console.error('SSE Connection failed:', err);
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === `gopay_payment_status_${activeInvoiceId}`) {
          if (e.newValue === 'paid') {
            setPaymentStatus('paid');
          } else {
            setPaymentStatus('unpaid');
          }
        }
      };

      window.addEventListener('storage', handleStorage);
      const interval = setInterval(checkStatus, 2011); // Poll for outer-device state shifts

      return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
        if (sse) {
          sse.close();
        }
      };
    }
  }, [activeInvoiceId]);

  // --- PERSISTENCE SYNCS ---
  useEffect(() => {
    localStorage.setItem('gopay_merchant_settings2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('gopay_cart_items2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gopay_selected_wallet2', selectedWallet);
  }, [selectedWallet]);

  // Record successful payments directly into orders ledger state, and pop user warning
  useEffect(() => {
    if (paymentStatus === 'paid' && cart.length > 0) {
      const orderAmount = cart.reduce((acc, item) => {
        const pr = item.customPrice !== undefined ? item.customPrice : item.product.price;
        return acc + pr * item.quantity;
      }, 0) * (1 + settings.taxRate / 100);

      const generatedId = activeInvoiceId.replace('INV-', '').slice(-4) || (Math.floor(Math.random() * 900) + 1050).toString();

      let orderTarget = 'Walk-in Customer';
      if (orderType === 'Dine In') {
        orderTarget = selectedTableId;
      } else if (orderType === 'Takeaway') {
        orderTarget = `Takeaway (${takeawayTime})`;
      } else if (orderType === 'Delivery') {
        orderTarget = `${deliveryAddress || 'No Address'} (${deliveryPhone || 'No Phone'})`;
      }

      const newPaidOrder: Order = {
        id: generatedId,
        type: orderType,
        target: orderTarget,
        itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0),
        total: orderAmount,
        status: 'Completed',
        timestamp: new Date().toISOString(),
        walletUsed: selectedWallet,
      };

      setOrders((prev) => {
        if (prev.some(o => o.id === newPaidOrder.id)) return prev;
        return [newPaidOrder, ...prev];
      });

      // Update relevant matching table current bill on simulated flow
      if (orderType === 'Dine In') {
        setTables((prev) => prev.map(t => t.id === orderTarget ? { ...t, status: 'Occupied', currentBill: orderAmount } : t));
      }

      showToast(`Order #${generatedId} of $${orderAmount.toFixed(2)} completed! Redirecting straight to Orders view.`, 'success');
      setCart([]);
      setActiveTab('orders');
    }
  }, [paymentStatus, cart, activeInvoiceId, selectedWallet, settings.taxRate, orderType, selectedTableId, takeawayTime, deliveryAddress, deliveryPhone]);

  // Check Web NFC Support dynamically upon mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      const isIframe = window.self !== window.top;
      if (!isIframe) {
        setIsNfcSupported(true);
      }
    }
  }, []);

  // Sync selected wallet in case default settings changes
  useEffect(() => {
    setSelectedWallet(settings.defaultWallet);
  }, [settings.defaultWallet]);

  // --- REAL-TIME POS LEDGER SYNC TRIGGER ---
  // Broadcast active total amount of terminal cashier basket up to `/api/update-terminal-price`
  useEffect(() => {
    if (typeof window !== 'undefined' && cart.length > 0 && !isCheckoutView) {
      const orderAmount = cart.reduce((acc, item) => {
        const pr = item.customPrice !== undefined ? item.customPrice : item.product.price;
        return acc + pr * item.quantity;
      }, 0) * (1 + settings.taxRate / 100);

      const updateTerminal = async () => {
        try {
          await fetch('/api/update-terminal-price', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              merchant: settings.merchantId || 'R-10245',
              terminal: 'counter_01',
              amount: parseFloat(orderAmount.toFixed(2)),
              provider: selectedWallet,
            }),
          });
        } catch (err) {
          console.warn('Failed to update terminal price on backend:', err);
        }
      };

      const timer = setTimeout(updateTerminal, 600);
      return () => clearTimeout(timer);
    }
  }, [cart, selectedWallet, settings.merchantId, settings.taxRate, isCheckoutView]);

  // --- BASKET OPERATIONS HANDLERS ---
  const handleAddProduct = (product: Product, customPrice?: number) => {
    setCart((prevCart) => {
      const isCustom = product.category === 'custom';
      
      const existingIndex = prevCart.findIndex((item) => {
        if (isCustom) {
          return item.product.id === product.id && item.customPrice === customPrice;
        }
        return item.product.id === product.id;
      });

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [...prevCart, { product, quantity: 1, customPrice }];
    });
  };

  const handleUpdateQuantity = (
    productId: string,
    delta: number,
    isCustom: boolean,
    customPrice?: number
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        if (isCustom) {
          return item.product.id === productId && item.customPrice === customPrice;
        }
        return item.product.id === productId;
      });

      if (existingIndex === -1) return prevCart;

      const updated = [...prevCart];
      const newQty = updated[existingIndex].quantity + delta;

      if (newQty <= 0) {
        updated.splice(existingIndex, 1);
      } else {
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
      }
      return updated;
    });
  };

  const handleRemoveItem = (productId: string, isCustom: boolean, customPrice?: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        if (isCustom) {
          return !(item.product.id === productId && item.customPrice === customPrice);
        }
        return item.product.id !== productId;
      })
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSaveSettings = (newSettings: MerchantSettings) => {
    setSettings(newSettings);
  };

  const handleUpdateTaxRate = (newRate: number) => {
    setSettings(prev => ({
      ...prev,
      taxRate: newRate
    }));
  };

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((acc, item) => {
    const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + tax;

  const currentInvoice: Invoice = {
    id: activeInvoiceId || 'R-10245',
    items: cart,
    subtotal: subtotal,
    tax: tax,
    total: total.toFixed(2) as any,
    merchantName: settings.merchantName,
    merchantId: settings.merchantId,
    wallet: selectedWallet,
    timestamp: new Date().toISOString(),
    nfcPayload: JSON.stringify({
      merchant: settings.merchantName,
      id: settings.merchantId,
      amount: total.toFixed(2),
      wallet: selectedWallet,
    }),
  };

  // True NFC physical write handler
  const handleTriggerNfcWrite = async (): Promise<boolean> => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (!isNfcSupported || isIframe) {
      // Simulate successful offline transmission for sandbox / presentation builds!
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1200);
      });
    }
    
    try {
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: 'text',
            data: currentInvoice.nfcPayload,
          },
        ],
      });
      return true;
    } catch (err: any) {
      console.error('NFC physically write caught error: ', err);
      const errMsg = err?.message || String(err);
      
      // Check if it failed due to top-level browsing context / iframe constraints
      if (err?.name === 'NotAllowedError' || errMsg.includes('browsing context') || errMsg.includes('top-level') || (typeof window !== 'undefined' && window.self !== window.top)) {
        showToast(
          'Physical Web NFC is blocked inside the preview iframe. Please click "Open in New Tab" to utilize active hardware NFC controllers!',
          'warning'
        );
        // Fall back gracefully so the client simulator can still proceed without feeling broken
        return true;
      }
      
      showToast(`Physical NFC controller failed to write: ${errMsg}`, 'error');
      return false;
    }
  };

  // Checkout View simulation path
  if (isCheckoutView) {
    if (!checkoutParams) {
      return (
        <div className="min-h-screen bg-[#030918] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a1122] border border-blue-900/30 rounded-[32px] p-6 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest font-mono">GoPay Smart Terminal</span>
              </div>
              <h2 className="text-lg font-black text-white italic tracking-tight">MOGADISHU POS CONNECT</h2>
            </div>

            {/* Pulsing visual circle representing a connection gateway */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-[3px] border-dashed border-blue-500/20 rounded-full animate-spin [animation-duration:15s]"></div>
              <div className="absolute inset-3 border border-blue-500/30 rounded-full animate-ping [animation-duration:3s]"></div>
              <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#122241] to-[#040916] border border-blue-500/40 shadow-[0_0_24px_rgba(47,128,237,0.25)] flex items-center justify-center text-white">
                <Smartphone className="w-7 h-7 text-blue-400 animate-bounce" />
              </div>
            </div>

            {/* Display location labels */}
            <div className="bg-[#122241]/75 border border-blue-500/25 py-2 px-4 rounded-full inline-flex items-center gap-1.5 justify-center font-mono font-bold text-xs text-white uppercase shadow-inner">
              📍 TERMINAL: {urlMerchantId === 'desk' ? 'CASHIER DESK' : `MERCHANT ${urlMerchantId || 'STANDBY'}`}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">Awaiting POS Transaction</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                Scan successful! Since this is a permanent QR code, please wait briefly while the cashier puts your order into the POS terminal.
              </p>
            </div>

            <div className="border-t border-blue-900/15 pt-3.5 text-[9px] text-slate-500 font-medium font-mono">
              Updating dynamically... Do not close page.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#030918] flex items-center justify-center p-4">
        <CustomerWalletSimulator
          invoiceId={checkoutParams.invoiceId}
          merchantName={checkoutParams.merchantName}
          merchantId={checkoutParams.merchantId}
          amount={checkoutParams.amount}
          wallet={checkoutParams.wallet}
          itemsJSON={checkoutParams.items}
          onConfirmPayment={() => {
            // handshake handled automatically via Local Storage listeners or NTFY polling triggers!
          }}
          inlineMode={false}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030918] text-white flex flex-col font-sans selection:bg-blue-500/30 select-none">
        <LoginView
          cashiers={cashiers}
          activeCashierId={activeCashierId}
          onSetActiveCashierId={setActiveCashierId}
          adminUser={adminUser}
          adminPass={adminPass}
          onSetAdminUnlocked={setIsAdminUnlocked}
          onLoginSuccess={() => setIsAuthenticated(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030918] text-white flex flex-col font-sans selection:bg-blue-500/30 select-none">
      
      {/* 1. Brand Header */}
      <Header
        settings={settings}
        isNfcSupported={isNfcSupported}
        cashierName={cashierName}
        shiftCode={shiftCode}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`border p-4 rounded-2xl shadow-2xl flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-[#091833] border-emerald-500/30 text-slate-100'
              : toast.type === 'warning'
                ? 'bg-[#1b160e] border-amber-500/40 text-slate-100'
                : 'bg-[#1c0a0e] border-rose-500/40 text-slate-100'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                : toast.type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/20 text-amber-400 font-bold'
                  : 'bg-rose-500/15 border-rose-500/20 text-rose-450'
            }`}>
              {toast.type === 'success' ? (
                <span className="font-black text-sm">✓</span>
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1 text-left">
              <p className={`text-[10px] font-black uppercase tracking-wider ${
                toast.type === 'success'
                  ? 'text-emerald-400'
                  : toast.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}>
                {toast.type === 'success' 
                  ? 'Transaction Success' 
                  : toast.type === 'warning'
                    ? 'Browser Environment Notice'
                    : 'Hardware Communication Error'}
              </p>
              <p className="text-xs text-slate-200 mt-0.5 font-sans leading-normal">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors self-start cursor-pointer animate-out"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout with Left Side navigation sidebar and right POS grid modules */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Left Side Menu Navigation Rail */}
        <Sidebar 
          activeTab={activeTab} 
          onChangeTab={setActiveTab} 
          onLogout={() => setIsAuthenticated(false)} 
          activeCashierPermission={activeCashier?.permissions}
          isAdminUnlocked={isAdminUnlocked}
        />

        {/* 3. Main Center POS Stage */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col space-y-6">
          
          {/* Determine if active cashier is authorized for this module */}
          {!isAdminUnlocked && !(activeTab === 'admin' || (activeCashier?.permissions ? activeCashier.permissions[activeTab] !== false : true)) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0c0407]/45 border border-rose-950/30 rounded-3xl min-h-[50vh] text-center space-y-6 max-w-xl mx-auto my-12 animate-in zoom-in-95 duration-250">
              <div className="w-16 h-16 bg-rose-955/20 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-450 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black tracking-tight text-white">Access Temporarily Restricted</h2>
                <p className="text-xs text-[#8C9AA9] leading-relaxed">
                  Your current logged cashier operator <span className="font-bold text-slate-200">"{activeCashier?.username}"</span> is not permitted to view the <span className="font-mono bg-[#1c0a0e] text-rose-450 px-2 py-0.5 rounded border border-rose-950 text-xs font-bold uppercase">{activeTab}</span> department in POS memory systems.
                </p>
              </div>
              <div className="bg-blue-955/10 border border-blue-900/15 p-4 rounded-xl text-left max-w-sm">
                <p className="text-[11px] text-slate-400 leading-normal">
                  💡 <span className="text-white font-bold">Manager Override Hint:</span> You can sign in to the <strong className="text-blue-400">Admin page</strong> using your manager credentials to toggle on permissions for this user or choose a different active operator.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="px-5 py-2.5 bg-[#183262] hover:bg-blue-600 text-xs font-black text-white rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                >
                  Configure Permissions (Admin Panel)
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'menu' && (
                isCheckingOut ? (
                  <CheckoutStage
                    cart={cart}
                    settings={settings}
                    orderType={orderType}
                    selectedTableId={selectedTableId}
                    takeawayTime={takeawayTime}
                    deliveryAddress={deliveryAddress}
                    deliveryPhone={deliveryPhone}
                    paymentStatus={paymentStatus}
                    onClearCart={handleClearCart}
                    onCancelPayment={() => {
                      handleClearCart();
                      setIsCheckingOut(false);
                    }}
                    onBackToCatalog={() => setIsCheckingOut(false)}
                    onTriggerNfcWrite={handleTriggerNfcWrite}
                    isNfcSupported={isNfcSupported}
                    selectedWallet={selectedWallet}
                    onChangeWallet={setSelectedWallet}
                    onSimulateDirectOrder={() => setPaymentStatus('paid')}
                    onOpenInlineSimulator={() => setIsInlineSimOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Dishes Menu shortcuts (col-span-8) */}
                    <div className="xl:col-span-8 flex flex-col h-full">
                      <BentoCatalog onAddProduct={handleAddProduct} />
                    </div>

                    {/* Right Invoice Receipt draft order slot (col-span-4) */}
                    <div className="xl:col-span-4 flex flex-col h-full justify-between">
                      <BasketPanel
                        cart={cart}
                        settings={settings}
                        selectedWallet={selectedWallet}
                        onChangeWallet={setSelectedWallet}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                        onAddProduct={handleAddProduct}
                        paymentStatus={paymentStatus}
                        onTriggerNfcWrite={handleTriggerNfcWrite}
                        onOpenInlineSimulator={() => setIsInlineSimOpen(true)}
                        onSimulateDirectOrder={() => setPaymentStatus('paid')}
                        onUpdateTaxRate={handleUpdateTaxRate}
                        orderType={orderType}
                        onChangeOrderType={setOrderType}
                        selectedTableId={selectedTableId}
                        onChangeSelectedTableId={setSelectedTableId}
                        tables={tables}
                        takeawayTime={takeawayTime}
                        onChangeTakeawayTime={setTakeawayTime}
                        deliveryAddress={deliveryAddress}
                        onChangeDeliveryAddress={setDeliveryAddress}
                        deliveryPhone={deliveryPhone}
                        onChangeDeliveryPhone={setDeliveryPhone}
                        onNavigateTab={setActiveTab}
                        isPrinterConnected={isPrinterConnected}
                        onSetPrinterConnected={setIsPrinterConnected}
                        autoPrintEnabled={autoPrintEnabled}
                        onSetAutoPrintEnabled={setAutoPrintEnabled}
                        connectedDevice={connectedDevice}
                        onSetConnectedDevice={setConnectedDevice}
                        onTriggerPrint={handleTriggerPrint}
                        onProceedToPayment={() => setIsCheckingOut(true)}
                      />
                    </div>

                  </div>
                )
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  orders={orders}
                  onRefresh={() => alert("Synchronized with active payment networks!")}
                  onNavigateTab={setActiveTab}
                  shiftLogs={shiftLogs}
                  activeCashierId={activeCashierId}
                  activeCashierName={cashierName}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onAddSimulatedOrder={(o) => setOrders(prev => [o, ...prev])}
                  onUpdateOrderStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))}
                />
              )}

              {activeTab === 'tables' && (
                <TablesView
                  tables={tables}
                  onAddSimulatedTable={(t) => setTables(prev => [...prev, t])}
                  onUpdateTableStatus={(id, status, bill, res) => setTables(prev => prev.map(t => t.id === id ? { ...t, status, currentBill: bill, reservedTime: res } : t))}
                  onStartTableOrder={(tableId) => {
                     setActiveInvoiceId(`INV-${Math.floor(Math.random() * 900) + 1050}-${tableId}`);
                     setActiveTab('menu');
                  }}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  onAddSimulatedCustomer={(c) => setCustomers(prev => [c, ...prev])}
                  onDeleteCustomer={(id) => setCustomers(prev => prev.filter(c => c.id !== id))}
                  onStartCustomerOrder={(customerId) => {
                     setActiveInvoiceId(`INV-${Math.floor(Math.random() * 900) + 1050}-${customerId}`);
                     setActiveTab('menu');
                  }}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView orders={orders} />
              )}

              {activeTab === 'discounts' && (
                <DiscountsView
                  discounts={discounts}
                  onAddSimulatedDiscount={(d) => setDiscounts(prev => [...prev, d])}
                  onDeleteDiscount={(id) => setDiscounts(prev => prev.filter(d => d.id !== id))}
                  onToggleDiscountStatus={(id) => setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Expired' : 'Active' } : d))}
                />
              )}

              {activeTab === 'admin' && (
                <AdminView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  cashiers={cashiers}
                  onUpdateCashiers={setCashiers}
                  activeCashierId={activeCashierId}
                  onChangeActiveCashierId={setActiveCashierId}
                  adminUser={adminUser}
                  onChangeAdminUser={setAdminUser}
                  adminPass={adminPass}
                  onChangeAdminPass={setAdminPass}
                  isAdminUnlocked={isAdminUnlocked}
                  onSetAdminUnlocked={setIsAdminUnlocked}
                  shiftLogs={shiftLogs}
                  onClearShiftLogs={() => {
                    setShiftLogs([]);
                  }}
                  onDeleteShiftLog={handleDeleteShiftLog}
                />
              )}

              {/* 4. Bottom Horizontal Bento boxes: NFC Transmitters & qr string payload console (shown on cashier Menu desk only to save screen space) */}
              {activeTab === 'menu' && !isCheckingOut && (
                <div className="pt-2">
                  <NFCInducer
                    invoice={currentInvoice}
                    isNfcSupported={isNfcSupported}
                    onTriggerNfcWrite={handleTriggerNfcWrite}
                    paymentStatus={paymentStatus}
                    onOpenInlineSimulator={() => setIsInlineSimOpen(true)}
                  />
                </div>
              )}
            </>
          )}

          {/* Majestic Footer branding bar */}
          <footer className="border-t border-blue-900/10 pt-4 pb-2 text-[#8C9AA9] text-[10px] flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#2F80ED] tracking-wide">GoPay</span>
              <span>Direct broadcast transmitter for the GoPay Wallet App.</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span>Ver. 1.0.0</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>
          </footer>

        </div>
      </div>

      {/* Interactive Customer Wallet Simulator Overlay drawer */}
      {isInlineSimOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative animate-in zoom-in-95 duration-200">
            <CustomerWalletSimulator
              invoiceId={activeInvoiceId || 'R-10245'}
              merchantName={settings.merchantName}
              merchantId={settings.merchantId}
              amount={total.toFixed(2)}
              wallet={selectedWallet}
              itemsJSON={JSON.stringify(cart.map(item => ({
                name: item.product.name,
                qty: item.quantity,
                price: item.customPrice !== undefined ? item.customPrice : item.product.price
              })))}
              onConfirmPayment={() => {
                setPaymentStatus('paid');
                // Auto close simulate drawer after user sees the success state
                setTimeout(() => {
                  setIsInlineSimOpen(false);
                }, 2200);
              }}
              onClose={() => setIsInlineSimOpen(false)}
              inlineMode={true}
            />
          </div>
        </div>
      )}

      {/* Dynamic Animated Thermal Printer Paper Spooling Simulation Overlay */}
      {showAnimatedReceiptRoll && (
        <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 print-hide">
          <div className="bg-[#0b172d] border border-blue-500/20 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Virtual Printer Hub Head */}
            <div className="flex items-center justify-between border-b border-blue-900/20 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400 animate-bounce" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Thermal Print Spooler</h3>
                  <p className="text-[10px] text-slate-400">Dispatching job to: {connectedDevice?.name || 'Local Port'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnimatedReceiptRoll(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tear receipt / Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Virtual Printer Feed Slot */}
            <div className="bg-slate-950 p-3.5 pt-1.5 rounded-2xl relative shadow-inner overflow-hidden min-h-[300px] flex flex-col items-center">
              {/* The Printer Slot Line */}
              <div className="w-11/12 h-2 bg-neutral-800 rounded bg-gradient-to-b from-[#10192e] to-black border-b border-blue-900/10 z-10 shadow-sm mb-2"></div>
              
              {/* The Sliding Paper Receipt */}
              <div className="receipt-roller-slide bg-white text-black p-4 w-72 shadow-2xl border-t-2 border-dashed border-neutral-300 text-[10px] font-mono space-y-3 shrink-0 select-none max-h-[240px] overflow-y-auto scrollbar-thin rounded-b-md text-left">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                  <span className="font-extrabold uppercase text-[11px] font-sans tracking-wide block">*** {settings.merchantName} ***</span>
                  <p className="text-[8px] text-gray-500 font-bold">POS Terminal ID: {settings.merchantId}</p>
                  <p className="text-[8px] text-gray-500">Date: {new Date().toLocaleTimeString()}</p>
                  <p className="border border-black px-1.5 py-0.5 rounded text-[8px] font-black inline-block mt-1 bg-gray-100">
                    ★ TRANSACTION COMPLETED ★
                  </p>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-gray-400 pb-2 space-y-1">
                  {cart.map((item) => {
                    const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
                    return (
                      <div key={`${item.product.id}-${price}`} className="flex justify-between">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing totals */}
                <div className="space-y-0.5 text-right font-bold text-[9px]">
                  <div className="flex justify-between font-normal text-gray-650">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-normal text-gray-650">
                    <span>Tax ({settings.taxRate}%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black border-t border-gray-300 pt-1 text-[11px]">
                    <span>TOTAL PRICE:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer seal */}
                <div className="text-center pt-2 space-y-1 text-[8px] text-gray-600 border-t border-dashed border-gray-300">
                  <p className="font-extrabold uppercase tracking-tight">EVC-PLUS DIGITAL MOBILE RECEIPT</p>
                  <p className="tracking-widest font-black">**** SUCCESSFUL ****</p>
                  <p className="text-[7px] text-gray-550 uppercase">Powered by GoPay Terminal Emulator</p>
                </div>
              </div>
            </div>

            {/* Simulated Action Drawer */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="py-2.5 px-3 bg-[#183262] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                <span>Re-print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAnimatedReceiptRoll(false)}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/10 active:scale-95 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Tear Slip / Done</span>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Elegant thermal-printer style printable invoice receipt */}
      <div className="print-only text-black p-6 w-full max-w-[3.5in] mx-auto text-xs space-y-4 font-mono">
        <div className="text-center border-b border-dashed border-gray-400 pb-4 space-y-2">
          {/* Logo seal */}
          <div className="flex flex-col items-center justify-center space-y-1.5 mb-2">
            <div className="w-16 h-16 rounded-full border border-black/80 flex items-center justify-center p-1 bg-white overflow-hidden">
              <img 
                src="https://picsum.photos/seed/restaurant-seal/120/120?grayscale=1" 
                alt="Restaurant Logo" 
                className="w-full h-full object-cover filter contrast-125 mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </div>
            <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0a9 9 0 019 9H3a9 9 0 019-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 14h20a1 1 0 011 1v1a2 2 0 01-2 2H3a2 2 0 01-2-2v-1a1 1 0 011-1z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-tight">{settings.merchantName}</h2>
          <p className="text-[10px] text-gray-550 font-bold">POS Identifier: {settings.merchantId}</p>
          <p className="text-[10px] text-gray-550">Date: {new Date().toLocaleString()}</p>
          <p className="text-[10px] text-gray-550">Receipt #: {currentInvoice.id}</p>
          
          <div className={`mt-2 py-1.5 px-3 border-2 text-center text-[10px] font-black uppercase tracking-wider rounded-md ${
            paymentStatus === 'paid' 
              ? 'border-black text-black bg-gray-100' 
              : 'border-black border-dashed text-black'
          }`}>
            {paymentStatus === 'paid' ? '★ TRANSACTION PAID ★' : '☆ UNPAID / BILL DRAFT ☆'}
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 pb-3 space-y-1">
          <div className="grid grid-cols-12 gap-1 font-bold text-[10px] uppercase border-b border-gray-300 pb-1 mb-1">
            <span className="col-span-6 font-bold">Item</span>
            <span className="col-span-2 text-center font-bold">Qty</span>
            <span className="col-span-4 text-right font-bold">Price</span>
          </div>

          {cart.map((item) => {
            const itemPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;
            return (
              <div key={`${item.product.id}-${itemPrice}`} className="grid grid-cols-12 gap-1 text-[11px]">
                <span className="col-span-6 truncate">{item.product.name}</span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-4 text-right">${(itemPrice * item.quantity).toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-1 text-right pt-2 border-b border-dashed border-gray-400 pb-3 font-semibold">
          <div className="flex justify-between text-[11px]">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>VAT ({settings.taxRate.toFixed(1)}%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center space-y-2 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wide">
            Target Wallet: {selectedWallet === 'evc' ? 'EVC Plus' : selectedWallet.toUpperCase()}
          </p>
          <p className="text-[9px] text-gray-650 italic">
            Thank you for dining with us!
          </p>
          <p className="text-[8px] text-gray-550 uppercase tracking-widest mt-2">
            *** Powered by GoPay ***
          </p>
        </div>
      </div>
    </div>
  );
}
