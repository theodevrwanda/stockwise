
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Layers, Eye, Edit, Trash2, ShoppingCart, Loader2, Download, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Interface for ProductRecord
interface Quantity {
  value: number;
  unit: 'pcs' | 'kg' | 'liter' | 'pack' | 'dozen' | 'meter' | 'box';
}

interface ProductRecord {
  id: string;
  productName: string;
  category: string;
  brand: string;
  model?: string;
  color?: string;
  condition: 'New' | 'Used' | 'Damaged';
  quantity: Quantity;
  branch: string;
  status: 'Sold' | 'Returned' | 'Deleted' | 'Store';
  costPrice: number;
  sellingPrice: number;
  totalAmountToPay: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Credit';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  dueDate?: string;
  customerName?: string;
  customerContact?: string;
  soldDate?: string;
  returnDeadline?: string;
  returnDate?: string | null;
  returnComment?: string;
  deletedDate?: string | null;
  lastUpdated: string;
  expiryDate?: string; // ISO date format
  supplier?: string;
  barcode?: string;
}

interface Branch {
  id: string;
  branchName: string;
}

interface SellForm {
  quantity: number | '';
  sellingPrice: number | '';
  customerName: string;
  customerContact: string;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Credit';
  amountPaid: number | '';
  dueDate: string;
  expiryDate: string;
  error: string;
  totalAmount: number;
}

// Mock data for mixed shop products
const mockBranches: Branch[] = [
  { id: 'branch1', branchName: 'Main Branch' },
  { id: 'branch2', branchName: 'Downtown Branch' },
];

const mockProducts: ProductRecord[] = [
  {
    id: '1',
    productName: 'Macbook Pro',
    category: 'Electronics',
    brand: 'Apple',
    model: 'M1 Pro',
    color: 'Silver',
    condition: 'New',
    quantity: { value: 50, unit: 'pcs' },
    branch: 'branch1',
    status: 'Store',
    costPrice: 1200000,
    sellingPrice: 1500000,
    totalAmountToPay: 0,
    amountPaid: 0,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Unpaid',
    lastUpdated: new Date().toISOString(),
    expiryDate: undefined,
    supplier: 'Tech Distributors',
    barcode: '123456789012',
  },
  {
    id: '2',
    productName: 'Organic Rice',
    category: 'Groceries',
    brand: 'FarmFresh',
    condition: 'New',
    quantity: { value: 100, unit: 'kg' },
    branch: 'branch2',
    status: 'Store',
    costPrice: 5000,
    sellingPrice: 7000,
    totalAmountToPay: 0,
    amountPaid: 0,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Unpaid',
    lastUpdated: new Date().toISOString(),
    expiryDate: '2026-06-30',
    supplier: 'Local Farms',
    barcode: '987654321098',
  },
  {
    id: '3',
    productName: 'Cotton T-Shirt',
    category: 'Clothing',
    brand: 'StyleTrend',
    color: 'Blue',
    condition: 'New',
    quantity: { value: 200, unit: 'pcs' },
    branch: 'branch1',
    status: 'Store',
    costPrice: 10000,
    sellingPrice: 15000,
    totalAmountToPay: 0,
    amountPaid: 0,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Unpaid',
    lastUpdated: new Date().toISOString(),
    expiryDate: undefined,
    supplier: 'Fashion Co.',
    barcode: '456789123456',
  },
];

const ProductsStorePage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRecord[]>(mockProducts);
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [addedDateFilter, setAddedDateFilter] = useState<string>('');
  const [sortField, setSortField] = useState<keyof ProductRecord>('productName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductRecord | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [productToSell, setProductToSell] = useState<ProductRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [productToView, setProductToView] = useState<ProductRecord | null>(null);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductRecord>>({
    productName: '',
    category: '',
    brand: '',
    model: '',
    color: '',
    condition: 'New',
    quantity: { value: 0, unit: 'pcs' },
    branch: branches[0]?.id || '',
    status: 'Store',
    costPrice: 0,
    sellingPrice: 0,
    totalAmountToPay: 0,
    amountPaid: 0,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Unpaid',
    lastUpdated: new Date().toISOString(),
    expiryDate: '',
    supplier: '',
    barcode: '',
  });
  const [sellForm, setSellForm] = useState<SellForm>({
    quantity: '',
    sellingPrice: '',
    customerName: '',
    customerContact: '',
    paymentMethod: 'Cash',
    amountPaid: '',
    dueDate: '',
    expiryDate: '',
    error: '',
    totalAmount: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Mock user data (assuming admin for simplicity)
  const user = { role: 'admin', branch: branches[0]?.id || '' };
  const isAdmin = user.role === 'admin';
  const userBranch = user.branch;

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate user branch
  useEffect(() => {
    if (!userBranch) {
      toast({
        title: 'Warning',
        description: 'No branch assigned to your account.',
        variant: 'destructive',
      });
    }
  }, [userBranch, toast]);

  // Update total amount in sell form
  useEffect(() => {
    if (sellDialogOpen && productToSell) {
      const qty = Number(sellForm.quantity);
      const price = Number(sellForm.sellingPrice);
      if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
        setSellForm(prev => ({ ...prev, totalAmount: qty * price }));
      } else {
        setSellForm(prev => ({ ...prev, totalAmount: 0 }));
      }
    }
  }, [sellForm.quantity, sellForm.sellingPrice, sellDialogOpen, productToSell]);

  const formatAmount = (amount: number): string => {
    return `RWF ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date?: string): string => {
    if (!date) return '–';
    return new Date(date).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (quantity: number) => {
    if (quantity > 5) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">In Store</Badge>;
    } else if (quantity > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Low Stock</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Out of Stock</Badge>;
  };

  const getBranchName = (branchId: string): string => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branchName : branchId;
  };

  const handleSort = (field: keyof ProductRecord) => {
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
        'Brand',
        'Model',
        'Color',
        'Condition',
        'Quantity',
        'Unit',
        'Branch',
        'Cost Price',
        'Selling Price',
        'Status',
        'Expiry Date',
        'Supplier',
        'Barcode',
        'Last Updated',
      ],
      ...filteredProducts.map(p => [
        p.productName,
        p.category,
        p.brand,
        p.model || '',
        p.color || '',
        p.condition,
        p.quantity.value.toString(),
        p.quantity.unit,
        getBranchName(p.branch),
        formatAmount(p.costPrice),
        formatAmount(p.sellingPrice),
        p.status,
        formatDate(p.expiryDate),
        p.supplier || '',
        p.barcode || '',
        formatDate(p.lastUpdated),
      ]),
    ]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store_products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditClick = (product: ProductRecord) => {
    if (!isAdmin) {
      toast({
        title: 'Warning',
        description: 'Only admins can edit products.',
        variant: 'destructive',
      });
      return;
    }
    setProductToEdit(product);
    setEditDialogOpen(true);
  };

  const handleSellClick = (product: ProductRecord) => {
    if (!userBranch) {
      toast({
        title: 'Warning',
        description: 'No branch assigned to your account.',
        variant: 'destructive',
      });
      return;
    }
    setProductToSell(product);
    setSellForm({
      quantity: '',
      sellingPrice: product.sellingPrice || '',
      customerName: '',
      customerContact: '',
      paymentMethod: 'Cash',
      amountPaid: '',
      dueDate: '',
      expiryDate: product.expiryDate || '',
      error: '',
      totalAmount: 0,
    });
    setSellDialogOpen(true);
  };

  const handleViewClick = (product: ProductRecord) => {
    setProductToView(product);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (product: ProductRecord) => {
    if (!isAdmin) {
      toast({
        title: 'Warning',
        description: 'Only admins can delete products.',
        variant: 'destructive',
      });
      return;
    }
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    setActionLoading(true);
    const updatedProducts = products.map(p =>
      p.id === productToDelete.id
        ? { ...p, status: 'Deleted', deletedDate: new Date().toISOString(), lastUpdated: new Date().toISOString() }
        : p
    );
    setProducts(updatedProducts);
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
    toast({
      title: 'Success',
      description: 'Product deleted successfully!',
    });
    setActionLoading(false);
  };

  const handleUpdateProduct = () => {
    if (!productToEdit) return;

    if (!productToEdit.productName || !productToEdit.category || !productToEdit.brand ||
        productToEdit.costPrice <= 0 || productToEdit.quantity.value <= 0 || !productToEdit.branch) {
      toast({
        title: 'Validation Error',
        description: 'All required fields must be filled, and cost price/quantity must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    const updatedProducts = products.map(p =>
      p.id === productToEdit.id
        ? { ...productToEdit, lastUpdated: new Date().toISOString() }
        : p
    );
    setProducts(updatedProducts);
    setEditDialogOpen(false);
    setProductToEdit(null);
    toast({
      title: 'Success',
      description: 'Product updated successfully!',
    });
    setActionLoading(false);
  };

  const handleSellProduct = () => {
    if (!productToSell || !userBranch) return;
    const quantity = Number(sellForm.quantity);
    const sellingPrice = Number(sellForm.sellingPrice);
    const amountPaid = Number(sellForm.amountPaid);

    if (quantity > productToSell.quantity.value) {
      setSellForm(prev => ({ ...prev, error: `Quantity cannot exceed available stock of ${productToSell.quantity.value}.` }));
      return;
    }
    if (quantity <= 0) {
      setSellForm(prev => ({ ...prev, error: 'Quantity must be greater than 0.' }));
      return;
    }
    if (sellingPrice <= 0) {
      setSellForm(prev => ({ ...prev, error: 'Selling price must be greater than 0.' }));
      return;
    }
    if (amountPaid < 0) {
      setSellForm(prev => ({ ...prev, error: 'Amount paid cannot be negative.' }));
      return;
    }
    if (!sellForm.customerName) {
      setSellForm(prev => ({ ...prev, error: 'Customer name is required.' }));
      return;
    }
    if (sellForm.expiryDate && new Date(sellForm.expiryDate) < new Date()) {
      setSellForm(prev => ({ ...prev, error: 'Expiry date cannot be in the past.' }));
      return;
    }

    setActionLoading(true);
    const totalAmount = quantity * sellingPrice;
    const balanceDue = totalAmount - amountPaid;
    const paymentStatus: 'Paid' | 'Partial' | 'Unpaid' = amountPaid >= totalAmount ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid';

    const updatedProducts = products.map(p =>
      p.id === productToSell.id
        ? {
            ...p,
            quantity: { ...p.quantity, value: p.quantity.value - quantity },
            status: p.quantity.value - quantity === 0 ? 'Sold' : p.status,
            sellingPrice,
            totalAmountToPay: totalAmount,
            amountPaid,
            balanceDue,
            paymentMethod: sellForm.paymentMethod,
            paymentStatus,
            customerName: sellForm.customerName,
            customerContact: sellForm.customerContact,
            dueDate: sellForm.dueDate || undefined,
            expiryDate: sellForm.expiryDate || undefined,
            soldDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }
        : p
    );
    setProducts(updatedProducts);
    setSellDialogOpen(false);
    setProductToSell(null);
    toast({
      title: 'Success',
      description: 'Product sold successfully!',
    });
    setActionLoading(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.category || !newProduct.brand ||
        newProduct.costPrice === undefined || newProduct.quantity?.value === undefined || !userBranch) {
      toast({
        title: 'Validation Error',
        description: 'All required fields must be filled.',
        variant: 'destructive',
      });
      return;
    }

    if (newProduct.quantity.value <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Quantity must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (newProduct.costPrice <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Cost price must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (newProduct.expiryDate && new Date(newProduct.expiryDate) < new Date()) {
      toast({
        title: 'Validation Error',
        description: 'Expiry date cannot be in the past.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    const newProductRecord: ProductRecord = {
      id: `prod_${Date.now()}`,
      productName: newProduct.productName,
      category: newProduct.category,
      brand: newProduct.brand,
      model: newProduct.model || undefined,
      color: newProduct.color || undefined,
      condition: newProduct.condition || 'New',
      quantity: newProduct.quantity || { value: 0, unit: 'pcs' },
      branch: userBranch,
      status: 'Store',
      costPrice: newProduct.costPrice,
      sellingPrice: newProduct.sellingPrice || 0,
      totalAmountToPay: 0,
      amountPaid: 0,
      balanceDue: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'Unpaid',
      lastUpdated: new Date().toISOString(),
      expiryDate: newProduct.expiryDate || undefined,
      supplier: newProduct.supplier || undefined,
      barcode: newProduct.barcode || undefined,
    };
    setProducts([...products, newProductRecord]);
    setAddProductDialogOpen(false);
    setNewProduct({
      productName: '',
      category: '',
      brand: '',
      model: '',
      color: '',
      condition: 'New',
      quantity: { value: 0, unit: 'pcs' },
      branch: userBranch,
      status: 'Store',
      costPrice: 0,
      sellingPrice: 0,
      totalAmountToPay: 0,
      amountPaid: 0,
      balanceDue: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'Unpaid',
      lastUpdated: new Date().toISOString(),
      expiryDate: '',
      supplier: '',
      barcode: '',
    });
    toast({
      title: 'Success',
      description: 'Product added successfully!',
    });
    setActionLoading(false);
  };

  const filteredProducts = products
    .filter(p =>
      p.status === 'Store' &&
      (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.barcode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       getBranchName(p.branch).toLowerCase().includes(searchTerm.toLowerCase()) ||
       (p.lastUpdated && formatDate(p.lastUpdated).toLowerCase().includes(searchTerm.toLowerCase())))
      &&
      (branchFilter === 'All' || p.branch === branchFilter) &&
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      (!addedDateFilter || (
        p.lastUpdated &&
        new Date(p.lastUpdated).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' }) ===
        new Date(addedDateFilter).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })
      ))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'lastUpdated' || sortField === 'expiryDate') {
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
      const aStr = sortField === 'branch' ? getBranchName(a[sortField] as string) : String(aValue || '').toLowerCase();
      const bStr = sortField === 'branch' ? getBranchName(b[sortField] as string) : String(bValue || '').toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  const categories = ['All', ...new Set(products.filter(p => p.status === 'Store').map(p => p.category))];

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Store Inventory</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage mixed shop products</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={handleExport} variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto">
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setAddProductDialogOpen(true)} variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto">
              Add Product
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-gray-400" />
              <Label className="text-gray-700 dark:text-gray-200">Branch</Label>
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Filter by Branch" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="All">All</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.branchName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="flex items-center gap-1">
              <Layers size={16} className="text-gray-400" />
              <Label className="text-gray-700 dark:text-gray-200">Category</Label>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <Input
              type="date"
              value={addedDateFilter}
              onChange={e => setAddedDateFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
          </div>
          <div className="relative flex-1 w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by name, category, brand, supplier, barcode"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg w-full"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No store products found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full">
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
                      <button onClick={() => handleSort('brand')} className="flex items-center gap-1">
                        Brand
                        {sortField === 'brand' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('supplier')} className="flex items-center gap-1">
                        Supplier
                        {sortField === 'supplier' && (
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
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('costPrice')} className="flex items-center gap-1">
                        Cost Price
                        {sortField === 'costPrice' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                      <button onClick={() => handleSort('expiryDate')} className="flex items-center gap-1">
                        Expiry Date
                        {sortField === 'expiryDate' && (
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
              {filteredProducts.map(product => (
                <TableRow key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <TableCell className="text-gray-900 dark:text-white font-medium">{product.productName}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="text-gray-900 dark:text-white">{product.category}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.brand}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.supplier || '–'}</TableCell>
                    </>
                  )}
                  <TableCell className="text-gray-900 dark:text-white">{product.quantity.value} {product.quantity.unit}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="text-gray-900 dark:text-white">{getBranchName(product.branch)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatAmount(product.costPrice)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatDate(product.expiryDate)}</TableCell>
                    </>
                  )}
                  <TableCell className="flex gap-2">
                    {isMobile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClick(product)}
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
                          onClick={() => handleViewClick(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                          title="View"
                          disabled={actionLoading}
                        >
                          <Eye size={18} />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                              title="Edit"
                              disabled={actionLoading}
                            >
                              <Edit size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                              title="Delete"
                              disabled={actionLoading}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </>
                        )}
                        {(isAdmin || product.quantity.value > 0) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSellClick(product)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                            title="Sell"
                            disabled={actionLoading}
                          >
                            <ShoppingCart size={18} />
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {productToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {productToView.productName}</p>
                  <p><strong>Category:</strong> {productToView.category}</p>
                  <p><strong>Brand:</strong> {productToView.brand}</p>
                  <p><strong>Model:</strong> {productToView.model || '–'}</p>
                  <p><strong>Color:</strong> {productToView.color || '–'}</p>
                  <p><strong>Condition:</strong> {productToView.condition}</p>
                  <p><strong>Quantity:</strong> {productToView.quantity.value} {productToView.quantity.unit}</p>
                </div>
                <div>
                  <p><strong>Branch:</strong> {getBranchName(productToView.branch)}</p>
                  <p><strong>Cost Price:</strong> {formatAmount(productToView.costPrice)}</p>
                  <p><strong>Selling Price:</strong> {formatAmount(productToView.sellingPrice)}</p>
                  <p><strong>Expiry Date:</strong> {formatDate(productToView.expiryDate)}</p>
                  <p><strong>Supplier:</strong> {productToView.supplier || '–'}</p>
                  <p><strong>Barcode:</strong> {productToView.barcode || '–'}</p>
                  <p><strong>Customer:</strong> {productToView.customerName || '–'}</p>
                  <p><strong>Contact:</strong> {productToView.customerContact || '–'}</p>
                </div>
              </div>
              {isMobile && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewDialogOpen(false);
                          handleEditClick(productToView);
                        }}
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                        disabled={actionLoading}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewDialogOpen(false);
                          handleDeleteClick(productToView);
                        }}
                        className="border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                  {(isAdmin || productToView.quantity.value > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleSellClick(productToView);
                      }}
                      className="border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                      disabled={actionLoading}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Sell
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
                setViewDialogOpen(false);
                setProductToView(null);
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {productToEdit && (
            <div className="space-y-4">
              <Input
                value={productToEdit.productName}
                onChange={e => setProductToEdit({ ...productToEdit, productName: e.target.value })}
                placeholder="Product Name"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.category}
                onChange={e => setProductToEdit({ ...productToEdit, category: e.target.value })}
                placeholder="Category (e.g., Electronics, Groceries, Clothing)"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.brand}
                onChange={e => setProductToEdit({ ...productToEdit, brand: e.target.value })}
                placeholder="Brand"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.model || ''}
                onChange={e => setProductToEdit({ ...productToEdit, model: e.target.value })}
                placeholder="Model"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.color || ''}
                onChange={e => setProductToEdit({ ...productToEdit, color: e.target.value })}
                placeholder="Color"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Select
                value={productToEdit.condition}
                onValueChange={value => setProductToEdit({ ...productToEdit, condition: value as 'New' | 'Used' | 'Damaged' })}
                disabled={actionLoading}
              >
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={productToEdit.quantity.value}
                onChange={e => setProductToEdit({ ...productToEdit, quantity: { ...productToEdit.quantity, value: parseInt(e.target.value) || 0 } })}
                placeholder="Quantity"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Select
                value={productToEdit.quantity.unit}
                onValueChange={value => setProductToEdit({ ...productToEdit, quantity: { ...productToEdit.quantity, unit: value as Quantity['unit'] } })}
                disabled={actionLoading}
              >
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {['pcs', 'kg', 'liter', 'pack', 'dozen', 'meter', 'box'].map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={productToEdit.costPrice}
                onChange={e => setProductToEdit({ ...productToEdit, costPrice: parseFloat(e.target.value) || 0 })}
                placeholder="Cost Price (RWF)"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                type="number"
                value={productToEdit.sellingPrice}
                onChange={e => setProductToEdit({ ...productToEdit, sellingPrice: parseFloat(e.target.value) || 0 })}
                placeholder="Selling Price (RWF)"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                type="date"
                value={productToEdit.expiryDate || ''}
                onChange={e => setProductToEdit({ ...productToEdit, expiryDate: e.target.value })}
                placeholder="Expiry Date"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.supplier || ''}
                onChange={e => setProductToEdit({ ...productToEdit, supplier: e.target.value })}
                placeholder="Supplier"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Input
                value={productToEdit.barcode || ''}
                onChange={e => setProductToEdit({ ...productToEdit, barcode: e.target.value })}
                placeholder="Barcode"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={actionLoading}
              />
              <Select
                value={productToEdit.branch}
                onValueChange={value => setProductToEdit({ ...productToEdit, branch: value })}
                disabled={actionLoading}
              >
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.branchName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setProductToEdit(null);
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sell Product</DialogTitle>
          </DialogHeader>
          {productToSell && (
            <div className="space-y-6">
              <p className="text-sm">Product: {productToSell.productName} (Available: {productToSell.quantity.value} {productToSell.quantity.unit})</p>
              <p className="text-sm">Branch: {getBranchName(productToSell.branch)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity to Sell</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={sellForm.quantity}
                    onChange={e => {
                      const newQty = e.target.value === '' ? '' : Number(e.target.value);
                      setSellForm(prev => ({
                        ...prev,
                        quantity: newQty,
                        error: newQty !== '' && newQty > productToSell.quantity.value ? `Quantity cannot exceed available stock of ${productToSell.quantity.value}.` :
                               newQty !== '' && newQty <= 0 ? 'Quantity must be greater than 0.' : '',
                      }));
                    }}
                    placeholder="Quantity"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (RWF)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={sellForm.sellingPrice}
                    onChange={e => setSellForm(prev => ({
                      ...prev,
                      sellingPrice: e.target.value === '' ? '' : Number(e.target.value),
                      error: e.target.value !== '' && Number(e.target.value) <= 0 ? 'Selling price must be greater than 0.' : prev.error,
                    }))}
                    placeholder="Selling Price"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={sellForm.customerName}
                    onChange={e => setSellForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Customer Name"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="customerContact">Customer Contact</Label>
                  <Input
                    id="customerContact"
                    value={sellForm.customerContact}
                    onChange={e => setSellForm(prev => ({ ...prev, customerContact: e.target.value }))}
                    placeholder="Customer Contact"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={sellForm.paymentMethod}
                    onValueChange={value => setSellForm(prev => ({ ...prev, paymentMethod: value as SellForm['paymentMethod'] }))}
                    disabled={actionLoading}
                  >
                    <SelectTrigger id="paymentMethod" className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {['Cash', 'Mobile Money', 'Bank Transfer', 'Credit'].map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amountPaid">Amount Paid (RWF)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={sellForm.amountPaid}
                    onChange={e => setSellForm(prev => ({
                      ...prev,
                      amountPaid: e.target.value === '' ? '' : Number(e.target.value),
                      error: e.target.value !== '' && Number(e.target.value) < 0 ? 'Amount paid cannot be negative.' : prev.error,
                    }))}
                    placeholder="Amount Paid"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={sellForm.dueDate}
                    onChange={e => setSellForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={sellForm.expiryDate}
                    onChange={e => setSellForm(prev => ({
                      ...prev,
                      expiryDate: e.target.value,
                      error: e.target.value && new Date(e.target.value) < new Date() ? 'Expiry date cannot be in the past.' : prev.error,
                    }))}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={actionLoading}
                  />
                </div>
              </div>
              {sellForm.totalAmount > 0 && (
                <p className="font-semibold text-lg">Total Amount: {formatAmount(sellForm.totalAmount)}</p>
              )}
              {sellForm.error && <p className="text-red-500 text-sm">{sellForm.error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSellDialogOpen(false);
                setProductToSell(null);
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSellProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={sellForm.quantity === '' || sellForm.sellingPrice === '' || !sellForm.customerName || !!sellForm.error || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newProduct.productName || ''}
              onChange={e => setNewProduct({ ...newProduct, productName: e.target.value })}
              placeholder="Product Name"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.category || ''}
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              placeholder="Category (e.g., Electronics, Groceries, Clothing)"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.brand || ''}
              onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              placeholder="Brand"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.model || ''}
              onChange={e => setNewProduct({ ...newProduct, model: e.target.value })}
              placeholder="Model"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.color || ''}
              onChange={e => setNewProduct({ ...newProduct, color: e.target.value })}
              placeholder="Color"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Select
              value={newProduct.condition}
              onValueChange={value => setNewProduct({ ...newProduct, condition: value as 'New' | 'Used' | 'Damaged' })}
              disabled={actionLoading}
            >
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={newProduct.quantity?.value || ''}
              onChange={e => setNewProduct({ ...newProduct, quantity: { ...newProduct.quantity!, value: parseInt(e.target.value) || 0 } })}
              placeholder="Quantity"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Select
              value={newProduct.quantity?.unit}
              onValueChange={value => setNewProduct({ ...newProduct, quantity: { ...newProduct.quantity!, unit: value as Quantity['unit'] } })}
              disabled={actionLoading}
            >
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {['pcs', 'kg', 'liter', 'pack', 'dozen', 'meter', 'box'].map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={newProduct.costPrice || ''}
              onChange={e => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
              placeholder="Cost Price (RWF)"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              type="number"
              value={newProduct.sellingPrice || ''}
              onChange={e => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
              placeholder="Selling Price (RWF)"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              type="date"
              value={newProduct.expiryDate || ''}
              onChange={e => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
              placeholder="Expiry Date (Optional)"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.supplier || ''}
              onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}
              placeholder="Supplier"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Input
              value={newProduct.barcode || ''}
              onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
              placeholder="Barcode"
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              disabled={actionLoading}
            />
            <Select
              value={newProduct.branch}
              onValueChange={value => setNewProduct({ ...newProduct, branch: value })}
              disabled={actionLoading}
            >
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.branchName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddProductDialogOpen(false);
                setNewProduct({
                  productName: '',
                  category: '',
                  brand: '',
                  model: '',
                  color: '',
                  condition: 'New',
                  quantity: { value: 0, unit: 'pcs' },
                  branch: userBranch,
                  status: 'Store',
                  costPrice: 0,
                  sellingPrice: 0,
                  totalAmountToPay: 0,
                  amountPaid: 0,
                  balanceDue: 0,
                  paymentMethod: 'Cash',
                  paymentStatus: 'Unpaid',
                  lastUpdated: new Date().toISOString(),
                  expiryDate: '',
                  supplier: '',
                  barcode: '',
                });
              }}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will delete{' '}
              <span className="font-semibold text-red-600">{productToDelete?.productName || 'this product'}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setProductToDelete(null);
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

export default ProductsStorePage;
