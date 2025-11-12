// src/types/index.ts

/*----------------user interface cross all pages ---------------*/
export interface User {
  id: string; // Firebase UID
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'admin' | 'staff';
  businessId: string;
  business: Business;
  branch: Branch | null;
  isActive: boolean;
  phone: string | null;
  gender: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
/*------------- business interface cross all pages ------------*/
export interface Business {
  id: string; // Firestore doc ID
  cell: string;
  district: string;
  duration: string;
  name: string;
  photo: string | null;
  plan: 'free' | 'basic' | 'pro';
  sector: string;
  village: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
}

/*-------------- branch interface cross all pages ------------*/
export interface Branch {
  id: string;
  name: string;          // e.g. "Main Branch"
  district: string;
  sector: string;
  cell: string;
  village: string;
}
/*------------ product interface cross all pages ---------------*/
export interface Quantity {
  value: number;
  unit: 'pcs' | 'kg' | 'liter' | 'pack' | 'dozen' | 'meter' | 'box';
}
export interface Product {
  id: string;
  productName: string;
  category: string;
  quantity: Quantity;
  branch: string;
  status: 'Sold' | 'Returned' | 'Deleted' | 'Store';
  costPrice: number;
  totalCostPrice: number;
  sellingPrice?: number;
  totalAmountToPay: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Credit';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  dueDate?: string;
  customerName?: string;
  customerContact?: string;
  soldDate?: string;
  expiryDate?: string;
  lastUpdated: string;
}
/*------ dashboard interface only used on dashboard page ----*/
export interface DashboardStats {
  totalProducts: number;
  totalEmployees: number;
  totalBranches: number;
  stockValue: number;
  soldProducts: number;
  expiryProducts: number;
  deletedProducts: number;
  totalProfit: number;
  totalRevenue: number;
  outstandingPayments: number;
  loss: number;
  mostStockedProduct: { name: string; units: number };
  leastStockedProduct: { name: string; units: number };
  mostSoldProduct: { name: string; units: number };
  productsAddedThisWeek: number;
  activeSuppliers: number;
}
/*------- authostate interface ---------*/
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token?: string;
}
/*------------theme interface --------*/
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
/*---- report interface only used in profilepage -------------*/
export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'financial' | 'employee' | 'branch';
  dateRange: { start: string; end: string };
  data: any;
  generatedBy: string;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'ready' | 'failed';
}
/*------------ Notification interface cross all pages ------------*/
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}