import React, { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Undo, Eye, Trash2, Loader2 } from 'lucide-react';
import SEOHelmet from '@/components/SEOHelmet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Product {
  id: string;
  productName: string;
  category: string;
  model?: string;
  quantity: number;
  branch: string;
  status: 'sold' | 'sold & restored';
  costPrice: number;
  sellingPrice: number | null;
  addedDate: Date | null;
  soldDate: Date | null;
  deadline: Date | null;
  restoreComment: string | null;
}

interface Branch {
  id: string;
  branchName: string;
}

type SortableProductKeys = 'productName' | 'category' | 'model' | 'quantity' | 'status' | 'costPrice' | 'sellingPrice' | 'deadline' | 'soldDate';
type SortDirection = 'asc' | 'desc';

const ProductsSoldPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [soldDateFilter, setSoldDateFilter] = useState<string>(''); // State for sold date filter
  const [sortField, setSortField] = useState<SortableProductKeys>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productForAction, setProductForAction] = useState<Product | null>(null);
  const [restoreComment, setRestoreComment] = useState('');
  const [restoreQuantity, setRestoreQuantity] = useState<number | string>('');
  const [restoreError, setRestoreError] = useState('');
  const [loading, setLoading] = useState(true);
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

  // Axios interceptors for token and error handling
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await auth.currentUser?.getIdToken(true);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [toast]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        toast({
          title: 'Error',
          description: 'You are not logged in. Please log in again.',
          variant: 'destructive',
        });
      }
    });
    return () => unsubscribe();
  }, [toast]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse<{ branches: Branch[] }>>('/products/branches');
        setBranches(response.data.data.branches);
        if (!response.data.data.branches.length) {
          toast({
            title: 'No Branches',
            description: 'No branches found in the database.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Fetch branches error:', error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [toast]);

  // Fetch sold products
  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axiosInstance.get<ApiResponse<{ products: any[] }>>('/sold');
      const productsData = response.data.data.products.map((product: any) => ({
        id: product._id,
        productName: product.productName,
        category: product.category,
        model: product.model,
        quantity: Number(product.quantity),
        branch: product.branch || 'Unknown',
        status: product.restoreComment ? 'sold & restored' : 'sold',
        costPrice: Number(product.costPrice),
        sellingPrice: product.sellingPrice ? Number(product.sellingPrice) : null,
        addedDate: product.addedDate ? new Date(product.addedDate) : null,
        soldDate: product.soldDate ? new Date(product.soldDate) : null,
        deadline: product.deadline ? new Date(product.deadline) : null,
        restoreComment: product.restoreComment || null,
      }));
      setProducts(productsData);
      if (!productsData.length) {
        toast({
          title: 'No Products',
          description: 'No sold products found in the database.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Fetch sold products error:', error);
      setProducts([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [toast]);

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === 0) return '–';
    return `Rwf ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const calculateTotalAmount = (quantity: number, sellingPrice: number | null) => {
    if (sellingPrice === null) return '–';
    const total = quantity * sellingPrice;
    return `Rwf ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '–';
    return date.toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBranchName = (branch: string): string => {
    return branch || 'Unknown';
  };

  const isReturnDeadlineValid = (deadline: Date | null) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline >= today;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'sold & restored': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateProfitLoss = () => {
    return filteredProducts.reduce((total, product) => {
      if (product.sellingPrice !== null) {
        const profit = (product.sellingPrice - product.costPrice) * product.quantity;
        return total + profit;
      }
      return total;
    }, 0);
  };

  const getProfitLossColor = (product: Product) => {
    if (product.sellingPrice !== null) {
      const profit = (product.sellingPrice - product.costPrice) * product.quantity;
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
        'Model/Variant',
        'Quantity',
        'Branch',
        'Status',
        'Cost Price',
        'Selling Price',
        'Total Amount',
        'Sold Date',
        'Return Deadline',
      ],
      ...filteredProducts.map(p => [
        p.productName,
        p.category,
        p.model || '',
        p.quantity.toString(),
        getBranchName(p.branch),
        p.status,
        formatAmount(p.costPrice),
        formatAmount(p.sellingPrice),
        calculateTotalAmount(p.quantity, p.sellingPrice),
        formatDate(p.soldDate),
        formatDate(p.deadline),
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

  const handleRestore = (product: Product) => {
    if (!isReturnDeadlineValid(product.deadline)) {
      toast({
        title: 'Error',
        description: 'Cannot restore: Return deadline has expired.',
        variant: 'destructive',
      });
      return;
    }
    setProductForAction(product);
    setRestoreComment('');
    setRestoreQuantity('');
    setRestoreError('');
    setRestoreDialogOpen(true);
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

  const confirmDelete = async () => {
    if (!productForAction) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/sold/${productForAction.id}`);
      setDeleteDialogOpen(false);
      setProductForAction(null);
      toast({
        title: 'Success',
        description: 'Sold product deleted successfully!',
      });
      await fetchProducts(false);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRestoreQuantity(value);
    const numValue = Number(value);

    if (!productForAction) return;

    if (value === '') {
      setRestoreError('');
    } else if (numValue <= 0) {
      setRestoreError('Quantity must be a positive number.');
    } else if (numValue > productForAction.quantity) {
      setRestoreError(`Quantity cannot exceed the sold quantity of ${productForAction.quantity}.`);
    } else {
      setRestoreError('');
    }
  };

  const confirmRestore = async () => {
    if (!productForAction) return;
    const numRestoreQuantity = Number(restoreQuantity);

    if (!restoreComment.trim() || numRestoreQuantity <= 0 || numRestoreQuantity > productForAction.quantity || !isReturnDeadlineValid(productForAction.deadline)) {
      setRestoreError('Please provide a valid quantity and comment, and ensure the return deadline is valid.');
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.put(`/sold/${productForAction.id}/restore`, {
        quantity: numRestoreQuantity,
        restoreComment: restoreComment.trim(),
      });
      setRestoreDialogOpen(false);
      setProductForAction(null);
      setRestoreComment('');
      setRestoreQuantity('');
      setRestoreError('');
      toast({
        title: 'Success',
        description: 'Product restored successfully!',
      });
      await fetchProducts(false);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const branchesList = ['All', ...branches.map(b => b.branchName)];
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const statuses = ['All', 'sold', 'sold & restored'];

  const filteredProducts = products
    .filter(p => {
      // Check if product matches search term
      const matchesSearch = (
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getBranchName(p.branch).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.deadline && formatDate(p.deadline).toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Check if product matches branch filter
      const matchesBranch = branchFilter === 'All' || getBranchName(p.branch) === branchFilter;

      // Check if product matches category filter
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      // Check if product matches status filter
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      // Check if product matches sold date filter (exact date match)
      const matchesSoldDate = !soldDateFilter || (
        p.soldDate &&
        new Date(p.soldDate).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' }) ===
        new Date(soldDateFilter).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })
      );

      return matchesSearch && matchesBranch && matchesCategory && matchesStatus && matchesSoldDate;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'deadline' || sortField === 'soldDate' || sortField === 'addedDate') {
        const aTime = aValue ? (aValue as Date).getTime() : 0;
        const bTime = bValue ? (bValue as Date).getTime() : 0;
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Sold Products - EMS: Inventory Management Platform"
        description="Manage sold products and process customer returns in the Electronic Management System."
        canonical="/products/sold"
      />
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Sold Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track sold products and process customer returns</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
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
        </div>

        {/* Profit/Loss Summary */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search"
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
              <div className="flex items-center gap-2">
                <Label className="text-gray-700 dark:text-gray-200">Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={actionLoading}>
                  <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                        <button onClick={() => handleSort('model')} className="flex items-center gap-1">
                          Model/Variant
                          {sortField === 'model' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-gray-700 dark:text-gray-200 font-semibold w-1/6 sm:w-auto">
                    <button onClick={() => handleSort('quantity')} className="flex items-center gap-1">
                      Qty
                      {sortField === 'quantity' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </TableHead>
                  {!isMobile && (
                    <>
                      <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                        <button onClick={() => handleSort('branch')} className="flex items-center gap-1">
                          Branch
                          {sortField === 'branch' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-gray-700 dark:text-gray-200 font-semibold w-1/6 sm:w-auto">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </TableHead>
                  {!isMobile && (
                    <>
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
                        Total Amount
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
                        <button onClick={() => handleSort('deadline')} className="flex items-center gap-1">
                          Return Deadline
                          {sortField === 'deadline' && (
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
                        <TableCell className="text-gray-900 dark:text-white">{product.model || '–'}</TableCell>
                      </>
                    )}
                    <TableCell className="text-gray-900 dark:text-white">{product.quantity}</TableCell>
                    {!isMobile && (
                      <TableCell className="text-gray-900 dark:text-white">{getBranchName(product.branch)}</TableCell>
                    )}
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.costPrice)}</TableCell>
                        <TableCell className={getProfitLossColor(product)}>
                          {formatAmount(product.sellingPrice)}
                        </TableCell>
                        <TableCell className={getProfitLossColor(product)}>
                          {calculateTotalAmount(product.quantity, product.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatDate(product.soldDate)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatDate(product.deadline)}</TableCell>
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
                          {isReturnDeadlineValid(product.deadline) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestore(product)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                              title="Restore"
                              disabled={actionLoading}
                            >
                              <Undo size={18} />
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
                    <p><strong>Model:</strong> {productForAction.model || '–'}</p>
                    <p><strong>Quantity:</strong> {productForAction.quantity}</p>
                    <p><strong>Status:</strong> {productForAction.status.charAt(0).toUpperCase() + productForAction.status.slice(1)}</p>
                  </div>
                  <div>
                    <p><strong>Branch:</strong> {getBranchName(productForAction.branch)}</p>
                    <p><strong>Cost Price:</strong> {formatAmount(productForAction.costPrice)}</p>
                    <p><strong>Selling Price:</strong> {formatAmount(productForAction.sellingPrice)}</p>
                    <p><strong>Total Amount:</strong> {calculateTotalAmount(productForAction.quantity, productForAction.sellingPrice)}</p>
                    <p><strong>Sold Date:</strong> {formatDate(productForAction.soldDate)}</p>
                    <p><strong>Return Deadline:</strong> {formatDate(productForAction.deadline)}</p>
                  </div>
                </div>
                {productForAction.restoreComment && (
                  <div>
                    <p><strong>Restore Comment:</strong></p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {productForAction.restoreComment}
                    </p>
                  </div>
                )}
                {isMobile && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isReturnDeadlineValid(productForAction.deadline) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewDetailsDialogOpen(false);
                          handleRestore(productForAction);
                        }}
                        className="border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                        disabled={actionLoading}
                      >
                        <Undo size={16} className="mr-2" />
                        Restore
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

        {/* Restore Dialog */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restore Product</DialogTitle>
              <DialogDescription>
                Restore {productForAction?.productName} back to inventory. Enter the quantity of returned products (must be at most {productForAction?.quantity || 0}) and a reason for the return.
              </DialogDescription>
            </DialogHeader>
            {productForAction && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Product:</strong> {productForAction.productName}</p>
                  <p><strong>Current Status:</strong> {productForAction.status.charAt(0).toUpperCase() + productForAction.status.slice(1)}</p>
                  <p><strong>Sold Quantity:</strong> {productForAction.quantity}</p>
                  <p className="text-red-500">
                    <strong className="text-gray-700 dark:text-gray-200">Return Deadline:</strong> {formatDate(productForAction.deadline)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Restore Quantity *</Label>
                  <Input
                    type="number"
                    value={restoreQuantity}
                    onChange={handleRestoreQuantityChange}
                    placeholder={`Enter quantity to restore (max: ${productForAction.quantity})`}
                    min={1}
                    max={productForAction.quantity}
                    required
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                  {restoreError && (
                    <p className="mt-2 text-sm text-red-600">{restoreError}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Restore Comment *</Label>
                  <Textarea
                    value={restoreComment}
                    onChange={(e) => setRestoreComment(e.target.value)}
                    placeholder="Enter reason for restoration (e.g., customer return, defective item, etc.)"
                    className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRestoreDialogOpen(false);
                  setProductForAction(null);
                  setRestoreComment('');
                  setRestoreQuantity('');
                  setRestoreError('');
                }}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRestore}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!restoreComment.trim() || restoreQuantity === '' || Number(restoreQuantity) <= 0 || !!restoreError || actionLoading}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Restore Product
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
    </>
  );
};

export default ProductsSoldPage;