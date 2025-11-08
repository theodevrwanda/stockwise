import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Trash2, Loader2, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Branch, Quantity } from '@/types';

// Mock data for products and branches
const mockBranches: Branch[] = [
  {
    id: 'branch1',
    branchName: 'Main Branch',
    district: 'Kicukiro',
    sector: 'Kagarama',
    cell: 'Rwimiyaga',
    village: 'Rukurazo',
    createdAt: new Date(),
  },
  {
    id: 'branch2',
    branchName: 'Downtown Branch',
    district: 'Nyarugenge',
    sector: 'Nyakabanda',
    cell: 'Kigali',
    village: 'Downtown',
    createdAt: new Date(),
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    productName: 'Macbook Pro',
    category: 'Electronics',
    quantity: { value: 5, unit: 'pcs' },
    branch: 'branch1',
    status: 'Sold',
    costPrice: 1200000,
    totalCostPrice: 5 * 1200000,
    sellingPrice: 1500000,
    totalAmountToPay: 5 * 1500000,
    amountPaid: 5 * 1500000,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    soldDate: '2025-10-20',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    productName: 'Organic Rice',
    category: 'Groceries',
    quantity: { value: 50, unit: 'kg' },
    branch: 'branch2',
    status: 'Sold',
    costPrice: 5000,
    totalCostPrice: 50 * 5000,
    sellingPrice: 7000,
    totalAmountToPay: 50 * 7000,
    amountPaid: 0,
    balanceDue: 50 * 7000,
    paymentMethod: 'Credit',
    paymentStatus: 'Unpaid',
    customerName: 'Jane Doe',
    customerContact: '+250789123456',
    dueDate: '2025-11-20',
    soldDate: '2025-10-15',
    expiryDate: '2026-06-30',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    productName: 'T-Shirt',
    category: 'Clothing',
    quantity: { value: 10, unit: 'pcs' },
    branch: 'branch1',
    status: 'Returned',
    costPrice: 10000,
    totalCostPrice: 10 * 10000,
    sellingPrice: 15000,
    totalAmountToPay: 10 * 15000,
    amountPaid: 100000,
    balanceDue: 10 * 15000 - 100000,
    paymentMethod: 'Credit',
    paymentStatus: 'Partial',
    customerName: 'John Smith',
    customerContact: '+250788987654',
    dueDate: '2025-11-10',
    soldDate: '2025-10-10',
    lastUpdated: new Date().toISOString(),
  },
];

type SortableProductKeys =
  | 'productName'
  | 'category'
  | 'quantity'
  | 'branch'
  | 'costPrice'
  | 'sellingPrice'
  | 'totalAmountToPay'
  | 'soldDate'
  | 'customerName'
  | 'customerContact'
  | 'dueDate'
  | 'paymentStatus'
  | 'balanceDue';
type SortDirection = 'asc' | 'desc';

const ProductsSoldPage: React.FC = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [soldDateFilter, setSoldDateFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortableProductKeys>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [productForAction, setProductForAction] = useState<Product | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view sold products.</p>
      </div>
    );
  }

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === 0) return '–';
    return `RWF ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '–';
    return new Date(date).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBranchName = (branch: string): string => {
    const branchObj = branches.find(b => b.id === branch);
    return branchObj ? branchObj.branchName : branch || 'Unknown';
  };

  const calculateProfitLoss = () => {
    return filteredProducts.reduce((total, product) => {
      if (product.sellingPrice !== undefined) {
        const profit = (product.sellingPrice - product.costPrice) * product.quantity.value;
        return total + profit;
      }
      return total;
    }, 0);
  };

  const getProfitLossColor = (product: Product) => {
    if (product.sellingPrice !== undefined) {
      const profit = (product.sellingPrice - product.costPrice) * product.quantity.value;
      if (profit > 0) {
        return 'text-green-600 dark:text-green-400';
      } else if (profit < 0) {
        return 'text-red-600 dark:text-red-400';
      }
    }
    return 'text-gray-900 dark:text-white';
  };

  const handleSort = (field: SortableProductKeys) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        'Product Name',
        'Category',
        'Quantity',
        'Unit',
        'Branch',
        'Cost Price',
        'Selling Price',
        'Total Amount',
        'Sold Date',
        'Customer Name',
        'Customer Contact',
        'Due Date',
        'Payment Status',
        'Balance Due',
      ],
      ...filteredProducts.map(p => [
        p.productName,
        p.category,
        p.quantity.value.toString(),
        p.quantity.unit,
        getBranchName(p.branch),
        formatAmount(p.costPrice),
        formatAmount(p.sellingPrice),
        formatAmount(p.totalAmountToPay),
        formatDate(p.soldDate),
        p.customerName || '–',
        p.customerContact || '–',
        formatDate(p.dueDate),
        p.paymentStatus || '–',
        formatAmount(p.balanceDue),
      ]),
    ]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sold_products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (product: Product) => {
    setProductForAction(product);
    setViewDetailsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin users can delete products.',
        variant: 'destructive',
      });
      return;
    }
    setProductForAction(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productForAction) return;
    setActionLoading(true);
    const updatedProducts = products.map(p =>
      p.id === productForAction.id
        ? { ...p, status: 'Deleted', lastUpdated: new Date().toISOString() }
        : p
    );
    setProducts(updatedProducts);
    setDeleteDialogOpen(false);
    setProductForAction(null);
    toast({
      title: 'Success',
      description: 'Sold product deleted successfully!',
    });
    setActionLoading(false);
  };

  const handleUpdatePayment = (product: Product) => {
    if (product.paymentMethod !== 'Credit') {
      toast({
        title: 'Error',
        description: 'Payment updates are only available for credit sales.',
        variant: 'destructive',
      });
      return;
    }
    setProductForAction(product);
    setPaymentAmount('');
    setPaymentError('');
    setPaymentDialogOpen(true);
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaymentAmount(value);
    const numValue = Number(value);

    if (!productForAction) return;

    if (value === '') {
      setPaymentError('');
    } else if (numValue <= 0) {
      setPaymentError('Payment amount must be a positive number.');
    } else if (numValue > productForAction.balanceDue) {
      setPaymentError(`Payment cannot exceed the balance due of ${formatAmount(productForAction.balanceDue)}.`);
    } else {
      setPaymentError('');
    }
  };

  const confirmPaymentUpdate = () => {
    if (!productForAction) return;
    const numPaymentAmount = Number(paymentAmount);

    if (numPaymentAmount <= 0 || numPaymentAmount > productForAction.balanceDue) {
      setPaymentError('Please provide a valid payment amount.');
      return;
    }

    setActionLoading(true);
    const newAmountPaid = productForAction.amountPaid + numPaymentAmount;
    const newBalanceDue = productForAction.totalAmountToPay - newAmountPaid;
    const newPaymentStatus =
      newBalanceDue === 0 ? 'Paid' :
      newAmountPaid > 0 ? 'Partial' : 'Unpaid';

    const updatedProducts = products.map(p =>
      p.id === productForAction.id
        ? {
            ...p,
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            paymentStatus: newPaymentStatus,
            lastUpdated: new Date().toISOString(),
          }
        : p
    );

    setProducts(updatedProducts);
    setPaymentDialogOpen(false);
    setProductForAction(null);
    setPaymentAmount('');
    setPaymentError('');
    toast({
      title: 'Success',
      description: `Payment of ${formatAmount(numPaymentAmount)} recorded successfully!`,
    });
    setActionLoading(false);
  };

  const branchesList = ['All', ...branches.map(b => b.branchName)];
  const categories = ['All', ...new Set(products.filter(p => p.status === 'Sold').map(p => p.category))];

  const filteredProducts = products
    .filter(p =>
      p.status === 'Sold' &&
      (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       getBranchName(p.branch).toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.soldDate && formatDate(p.soldDate).toLowerCase().includes(searchTerm.toLowerCase())) ||
       (p.customerName && p.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (p.customerContact && p.customerContact.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (p.dueDate && formatDate(p.dueDate).toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (branchFilter === 'All' || getBranchName(p.branch) === branchFilter) &&
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      (!soldDateFilter || (
        p.soldDate &&
        new Date(p.soldDate).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' }) ===
        new Date(soldDateFilter).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })
      ))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'soldDate' || sortField === 'dueDate' || sortField === 'lastUpdated') {
        const aTime = aValue ? new Date(aValue as string).getTime() : 0;
        const bTime = bValue ? new Date(bValue as string).getTime() : 0;
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }
      if (sortField === 'quantity') {
        const aQty = (aValue as Quantity).value;
        const bQty = (bValue as Quantity).value;
        return sortDirection === 'asc' ? aQty - bQty : bQty - aQty;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = sortField === 'branch' ? getBranchName(a[sortField] as string) :
                   String(aValue || '').toLowerCase();
      const bStr = sortField === 'branch' ? getBranchName(b[sortField] as string) :
                   String(bValue || '').toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sold Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track sold products and manage credit payments</p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
          disabled={actionLoading}
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Profit/Loss Summary */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profit/Loss Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Total for {filteredProducts.length} visible product{filteredProducts.length !== 1 ? 's' : ''}:
              <span className={`ml-2 font-bold ${calculateProfitLoss() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {calculateProfitLoss() >= 0 ? '+' : ''}{formatAmount(calculateProfitLoss())}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by name, category, customer"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              disabled={actionLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-700 dark:text-gray-200">Sold Date:</Label>
            <Input
              type="date"
              value={soldDateFilter}
              onChange={e => setSoldDateFilter(e.target.value)}
              className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-700 dark:text-gray-200">Branch:</Label>
            <Select value={branchFilter} onValueChange={setBranchFilter} disabled={actionLoading}>
              <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Filter by Branch" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {branchesList.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-700 dark:text-gray-200">Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={actionLoading}>
              <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No sold products found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold w-1/3 sm:w-auto">
                  <button onClick={() => handleSort('productName')} className="flex items-center gap-1">
                    Product Name
                    {sortField === 'productName' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('category')} className="flex items-center gap-1">
                        Category
                        {sortField === 'category' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold w-1/6 sm:w-auto">
                      <button onClick={() => handleSort('quantity')} className="flex items-center gap-1">
                        Quantity
                        {sortField === 'quantity' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('branch')} className="flex items-center gap-1">
                        Branch
                        {sortField === 'branch' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('costPrice')} className="flex items-center gap-1">
                        Cost Price
                        {sortField === 'costPrice' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('sellingPrice')} className="flex items-center gap-1">
                        Selling Price
                        {sortField === 'sellingPrice' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('totalAmountToPay')} className="flex items-center gap-1">
                        Total Amount
                        {sortField === 'totalAmountToPay' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('soldDate')} className="flex items-center gap-1">
                        Sold Date
                        {sortField === 'soldDate' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('customerName')} className="flex items-center gap-1">
                        Customer Name
                        {sortField === 'customerName' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('customerContact')} className="flex items-center gap-1">
                        Customer Contact
                        {sortField === 'customerContact' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1">
                        Due Date
                        {sortField === 'dueDate' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('paymentStatus')} className="flex items-center gap-1">
                        Payment Status
                        {sortField === 'paymentStatus' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('balanceDue')} className="flex items-center gap-1">
                        Balance Due
                        {sortField === 'balanceDue' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                  </>
                )}
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold w-1/3 sm:w-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TableCell className="text-gray-900 dark:text-white font-medium">{product.productName}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="text-gray-900 dark:text-white">{product.category}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.quantity.value} {product.quantity.unit}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{getBranchName(product.branch)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.costPrice)}</TableCell>
                      <TableCell className={getProfitLossColor(product)}>{formatAmount(product.sellingPrice)}</TableCell>
                      <TableCell className={getProfitLossColor(product)}>{formatAmount(product.totalAmountToPay)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatDate(product.soldDate)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.customerName || '–'}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.customerContact || '–'}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatDate(product.dueDate)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.paymentStatus || '–'}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.balanceDue)}</TableCell>
                    </>
                  )}
                  <TableCell className="flex gap-2">
                    {isMobile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(product)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                        title="See All"
                        disabled={actionLoading}
                      >
                        <Eye size={18} />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                          title="View"
                          disabled={actionLoading}
                        >
                          <Eye size={18} />
                        </Button>
                        {product.paymentMethod === 'Credit' && product.balanceDue > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdatePayment(product)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                            title="Update Payment"
                            disabled={actionLoading}
                          >
                            <DollarSign size={18} />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                            title="Delete"
                            disabled={actionLoading}
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {productForAction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {productForAction.productName}</p>
                  <p><strong>Category:</strong> {productForAction.category}</p>
                  <p><strong>Quantity:</strong> {productForAction.quantity.value} {productForAction.quantity.unit}</p>
                  <p><strong>Branch:</strong> {getBranchName(productForAction.branch)}</p>
                </div>
                <div>
                  <p><strong>Cost Price:</strong> {formatAmount(productForAction.costPrice)}</p>
                  <p><strong>Selling Price:</strong> {formatAmount(productForAction.sellingPrice)}</p>
                  <p><strong>Total Amount:</strong> {formatAmount(productForAction.totalAmountToPay)}</p>
                  <p><strong>Sold Date:</strong> {formatDate(productForAction.soldDate)}</p>
                  <p><strong>Payment Method:</strong> {productForAction.paymentMethod || '–'}</p>
                </div>
                {productForAction.paymentMethod === 'Credit' && (
                  <div>
                    <p><strong>Customer Name:</strong> {productForAction.customerName || '–'}</p>
                    <p><strong>Customer Contact:</strong> {productForAction.customerContact || '–'}</p>
                    <p><strong>Due Date:</strong> {formatDate(productForAction.dueDate)}</p>
                    <p><strong>Payment Status:</strong> {productForAction.paymentStatus || '–'}</p>
                    <p><strong>Balance Due:</strong> {formatAmount(productForAction.balanceDue)}</p>
                    <p><strong>Amount Paid:</strong> {formatAmount(productForAction.amountPaid)}</p>
                  </div>
                )}
              </div>
              {isMobile && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {productForAction.paymentMethod === 'Credit' && productForAction.balanceDue > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewDetailsDialogOpen(false);
                        handleUpdatePayment(productForAction);
                      }}
                      className="border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                      disabled={actionLoading}
                    >
                      <DollarSign size={16} className="mr-2" />
                      Update Payment
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewDetailsDialogOpen(false);
                        handleDelete(productForAction);
                      }}
                      className="border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                      disabled={actionLoading}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewDetailsDialogOpen(false);
                setProductForAction(null);
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {productForAction?.productName} (Credit Sale).
            </DialogDescription>
          </DialogHeader>
          {productForAction && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Product:</strong> {productForAction.productName}</p>
                <p><strong>Total Amount:</strong> {formatAmount(productForAction.totalAmountToPay)}</p>
                <p><strong>Amount Paid:</strong> {formatAmount(productForAction.amountPaid)}</p>
                <p><strong>Balance Due:</strong> {formatAmount(productForAction.balanceDue)}</p>
                <p><strong>Customer:</strong> {productForAction.customerName || '–'}</p>
                <p><strong>Due Date:</strong> {formatDate(productForAction.dueDate)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Payment Amount *</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={handlePaymentAmountChange}
                  placeholder={`Enter payment amount (max: ${formatAmount(productForAction.balanceDue)})`}
                  min={1}
                  max={productForAction.balanceDue}
                  required
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={actionLoading}
                />
                {paymentError && (
                  <p className="mt-2 text-sm text-red-600">{paymentError}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false);
                setProductForAction(null);
                setPaymentAmount('');
                setPaymentError('');
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPaymentUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!paymentAmount || Number(paymentAmount) <= 0 || !!paymentError || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will delete{' '}
              <span className="font-semibold text-red-600">{productForAction?.productName || 'this product'}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProductForAction(null);
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsSoldPage;