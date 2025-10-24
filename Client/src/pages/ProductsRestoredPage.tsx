import React, { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, ShoppingBasket, Eye, Trash2, Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  branch: {
    id: string;
    branchName: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
  };
  status: 'store' | 'sold' | 'restored' | 'deleted';
  costPrice: number;
  sellingPrice: number | null;
  addedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  restoreComment?: string;
}

interface Branch {
  id: string;
  branchName: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

type SortableProductKeys = 'productName' | 'category' | 'model' | 'quantity' | 'branch' | 'status' | 'costPrice' | 'sellingPrice';
type SortDirection = 'asc' | 'desc';

// Sell Product Dialog Component
interface SellProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: (id: string, newQuantity: number, newSellingPrice: number) => void;
  actionLoading: boolean;
}

const SellProductDialog: React.FC<SellProductDialogProps> = ({ open, onOpenChange, product, onConfirm, actionLoading }) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setQuantity('');
      setSellingPrice(product?.sellingPrice || '');
      setError('');
      setTotalAmount(0);
    }
  }, [open, product]);

  useEffect(() => {
    const qty = Number(quantity);
    const price = Number(sellingPrice);
    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      setTotalAmount(qty * price);
    } else {
      setTotalAmount(0);
    }
  }, [quantity, sellingPrice]);

  const handleConfirm = () => {
    if (!product) return;

    if (quantity === '' || quantity <= 0 || quantity > product.quantity) {
      setError(`Quantity must be a number between 1 and ${product.quantity}.`);
      return;
    }

    if (sellingPrice === '' || sellingPrice <= 0) {
      setError('Selling price must be greater than 0.');
      return;
    }

    setError('');
    onConfirm(product.id, Number(quantity), Number(sellingPrice));
    onOpenChange(false);
  };

  const formatAmount = (amount: number) => {
    return `Rwf ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Restored Product: {product.productName}</DialogTitle>
          <DialogDescription>
            Enter the details to re-list this product for sale. Available quantity: {product.quantity}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity to Sell</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQty = e.target.value === '' ? '' : Number(e.target.value);
                setQuantity(newQty);
                if (newQty !== '' && newQty > (product.quantity || 0)) {
                  setError(`Quantity cannot exceed available stock of ${product.quantity}.`);
                } else if (newQty !== '' && newQty <= 0) {
                  setError('Quantity must be greater than 0.');
                } else {
                  setError('');
                }
              }}
              min={1}
              max={product.quantity}
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
          </div>
          <div>
            <Label htmlFor="sellingPrice">Selling Price (RWF)</Label>
            <Input
              id="sellingPrice"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
          </div>
          {totalAmount > 0 && (
            <p className="font-semibold text-lg">Total Amount: {formatAmount(totalAmount)}</p>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={quantity === '' || sellingPrice === '' || !!error || actionLoading}
          >
            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const ProductsRestoredPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const canSell = isAdmin || isStaff;
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortableProductKeys>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [productForAction, setProductForAction] = useState<Product | null>(null);
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
        const response = await axiosInstance.get<ApiResponse<{ branches: Branch[] }>>('/restored/branches');
        let branchesData: Branch[] = [];
        if (response.data.success && response.data.data?.branches) {
          branchesData = response.data.data.branches;
        } else if (response.data.success && response.data.branches) {
          branchesData = response.data.branches;
        } else if (Array.isArray(response.data)) {
          branchesData = response.data;
        } else {
          throw new Error('Unexpected branches response format');
        }
        setBranches(branchesData.map((branch: any) => ({
          id: branch._id || branch.id,
          branchName: branch.branchName,
          district: branch.district,
          sector: branch.sector,
          cell: branch.cell,
          village: branch.village,
        })));
        if (!branchesData.length) {
          toast({
            title: 'No Branches',
            description: 'No branches found in the database.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Fetch branches error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch branches. Using branch data from products.',
          variant: 'destructive',
        });
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [toast]);

  // Fetch restored products
  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axiosInstance.get<ApiResponse<{ products: any[] }>>('/restored');
      const productsData = response.data.data.products.map((product: any) => ({
        id: product._id,
        productName: product.productName,
        category: product.category,
        model: product.model,
        quantity: Number(product.quantity),
        branch: {
          id: product.branch._id || product.branch.id,
          branchName: product.branch.branchName,
          district: product.branch.district,
          sector: product.branch.sector,
          cell: product.branch.cell,
          village: product.branch.village,
        },
        status: product.status,
        costPrice: Number(product.costPrice),
        sellingPrice: product.sellingPrice ? Number(product.sellingPrice) : null,
        addedDate: product.addedDate ? new Date(product.addedDate) : undefined,
        createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
        updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        restoreComment: product.restoreComment,
      }));
      setProducts(productsData);
      // Update branches from product data as a fallback
      const uniqueBranches = Array.from(
        new Map(
          productsData.map(p => [p.branch.id, p.branch])
        ).values()
      );
      setBranches(prev => [...prev, ...uniqueBranches.filter(b => !prev.some(pb => pb.id === b.id))]);
      if (!productsData.length) {
        toast({
          title: 'No Products',
          description: 'No restored products found in the database.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Fetch restored products error:', error);
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

  const getBranchName = (branch: Product['branch']): string => {
    return branch ? `${branch.branchName}` : 'Unknown';
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return '–';
    return `Rwf ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const calculateTotalAmount = (quantity: number, sellingPrice: number | null) => {
    if (!sellingPrice) return '–';
    const total = quantity * sellingPrice;
    return `Rwf ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '–';
    return date.toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      store: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      restored: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSort = (field: SortableProductKeys) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async () => {
    try {
      setActionLoading(true);
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
          'Date Added',
          'Restore Comment',
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
          formatDate(p.addedDate),
          p.restoreComment || '',
        ]),
      ]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'restored_products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export CSV error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export CSV.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
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

  const handleSell = (product: Product) => {
    if (!canSell) {
      toast({
        title: 'Error',
        description: 'Only admin or staff users can sell products.',
        variant: 'destructive',
      });
      return;
    }
    setProductForAction(product);
    setSellDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productForAction) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/restored/${productForAction.id}`);
      setDeleteDialogOpen(false);
      setProductForAction(null);
      toast({
        title: 'Success',
        description: 'Product deleted successfully!',
      });
      await fetchProducts(false);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const confirmSell = async (id: string, newQuantity: number, newSellingPrice: number) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/restored/${id}/sell`, {
        quantity: newQuantity,
        sellingPrice: newSellingPrice,
      });
      const updatedProduct = response.data.data;
      if (updatedProduct.status === 'sold') {
        setProducts(products.filter(p => p.id !== id));
      } else {
        setProducts(products.map(p => (p.id === id ? {
          ...p,
          quantity: Number(updatedProduct.quantity),
          sellingPrice: updatedProduct.sellingPrice ? Number(updatedProduct.sellingPrice) : null,
          status: updatedProduct.status,
          updatedAt: updatedProduct.updatedAt ? new Date(updatedProduct.updatedAt) : undefined,
        } : p)));
      }
      setSellDialogOpen(false);
      setProductForAction(null);
      toast({
        title: 'Success',
        description: 'Product sold successfully!',
      });
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p =>
      (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       getBranchName(p.branch).toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.restoreComment || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (branchFilter === 'All' || getBranchName(p.branch) === branchFilter) &&
      (categoryFilter === 'All' || p.category === categoryFilter)
    )
    .sort((a, b) => {
      const aValue = sortField === 'branch' ? getBranchName(a.branch).toLowerCase() : a[sortField];
      const bValue = sortField === 'branch' ? getBranchName(b.branch).toLowerCase() : b[sortField];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const branchesList = ['All', ...branches.map(b => b.branchName)];

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
        title="Restored Products - EMS: Inventory Management Platform"
        description="View and manage products that have been restored to inventory after a return in the Electronic Management System."
        canonical="/products/restored"
      />
      <div className="space-y-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Restored Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View products that have been returned and restored to inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
              disabled={actionLoading}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, category, model, branch, status, or comment..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg w-full"
                  disabled={actionLoading}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-48">
                <Label className="text-gray-700 dark:text-gray-200">Branch:</Label>
                <Select value={branchFilter} onValueChange={setBranchFilter} disabled={actionLoading}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Filter by Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {branchesList.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-48">
                <Label className="text-gray-700 dark:text-gray-200">Category:</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={actionLoading}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
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
          </CardContent>
        </Card>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No restored products found matching your criteria.</p>
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
                        Date Added
                      </TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                        Restore Comment
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
                    <TableCell className="text-gray-900 dark:text-white font-medium truncate">{product.productName}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="text-gray-900 dark:text-white truncate">{product.category}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white truncate">{product.model || '–'}</TableCell>
                      </>
                    )}
                    <TableCell className="text-gray-900 dark:text-white text-center">{product.quantity}</TableCell>
                    {!isMobile && (
                      <TableCell className="text-gray-900 dark:text-white truncate">{getBranchName(product.branch)}</TableCell>
                    )}
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.costPrice)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.sellingPrice)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{calculateTotalAmount(product.quantity, product.sellingPrice)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatDate(product.addedDate)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white truncate">{product.restoreComment || '–'}</TableCell>
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
                          <Eye size={18} /> See All
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
                          {canSell && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSell(product)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                              title="Sell"
                              disabled={actionLoading}
                            >
                              <ShoppingBasket size={18} />
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
                    <p><strong>Date Added:</strong> {formatDate(productForAction.addedDate)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(productForAction.updatedAt)}</p>
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
                    {canSell && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewDetailsDialogOpen(false);
                          handleSell(productForAction);
                        }}
                        className="border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                        disabled={actionLoading}
                      >
                        <ShoppingBasket size={16} className="mr-2" />
                        Sell
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

        {/* Sell Product Dialog */}
        <SellProductDialog
          open={sellDialogOpen}
          onOpenChange={setSellDialogOpen}
          product={productForAction}
          onConfirm={confirmSell}
          actionLoading={actionLoading}
        />
      </div>
    </>
  );
};

export default ProductsRestoredPage;