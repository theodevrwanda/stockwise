// src/types/index.ts

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

export interface Branch {
  id: string;
  branchName: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  role: 'admin' | 'staff';
  branch?: string | Branch;
  imagephoto?: string | null;
  email: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token?: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'financial' | 'employee' | 'branch';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedBy: string;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'ready' | 'failed';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}