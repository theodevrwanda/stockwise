import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ShoppingCart, Loader2, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'pcs';
  costPrice: number;
  totalCostPrice: number;
  expiryDate?: string;
  lastUpdated: string;
}

interface SellForm {
  quantity: number | '';
  sellingPrice: number | '';
  paymentMethod: 'Paid' | 'Credit';
  customerName?: string;
  customerPhone?: string;
  error: string;
  totalAmount: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Macbook Pro',
    category: 'Electronics',
    quantity: 50,
    unit: 'pcs',
    costPrice: 1200000,
    totalCostPrice: 60000000,
    expiryDate: undefined,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Organic Rice',
    category: 'Groceries',
    quantity: 100,
    unit: 'kg',
    costPrice: 5000,
    totalCostPrice: 500000,
    expiryDate: '2026-06-30',
    lastUpdated: new Date().toISOString(),
  },
];

const ProductsStorePage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form States
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pcs' as 'kg' | 'pcs',
    costPrice: '',
    expiryDate: '',
  });

  const [sellForm, setSellForm] = useState<SellForm>({
    quantity: '',
    sellingPrice: '',
    paymentMethod: 'Paid',
    customerName: '',
    customerPhone: '',
    error: '',
    totalAmount: 0,
  });

  useEffect(() => {
    const qty = Number(sellForm.quantity);
    const price = Number(sellForm.sellingPrice);
    if (qty > 0 && price > 0) {
      setSellForm(prev => ({ ...prev, totalAmount: qty * price }));
    } else {
      setSellForm(prev => ({ ...prev, totalAmount: 0 }));
    }
  }, [sellForm.quantity, sellForm.sellingPrice]);

  const formatAmount = (amount: number) => `RWF ${amount.toLocaleString()}`;
  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-RW') : '–');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products
    .filter(p => p.quantity > 0)
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => categoryFilter === 'All' || p.category === categoryFilter);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.costPrice) {
      toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    const qty = Number(newProduct.quantity);
    const cost = Number(newProduct.costPrice);

    if (qty <= 0 || cost <= 0) {
      toast({ title: 'Error', description: 'Quantity and cost price must be greater than 0.', variant: 'destructive' });
      return;
    }

    if (newProduct.expiryDate && new Date(newProduct.expiryDate) < new Date()) {
      toast({ title: 'Error', description: 'Expiry date cannot be in the past.', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    const product: Product = {
      id: `prod_${Date.now()}`,
      name: newProduct.name.trim(),
      category: newProduct.category.trim(),
      quantity: qty,
      unit: newProduct.unit,
      costPrice: cost,
      totalCostPrice: qty * cost,
      expiryDate: newProduct.expiryDate || undefined,
      lastUpdated: new Date().toISOString(),
    };

    setProducts([...products, product]);
    setAddDialogOpen(false);
    setNewProduct({ name: '', category: '', quantity: '', unit: 'pcs', costPrice: '', expiryDate: '' });
    toast({ title: 'Success', description: 'Product added!' });
    setActionLoading(false);
  };

  const handleUpdateProduct = () => {
    if (!productToEdit) return;

    const qty = Number(productToEdit.quantity);
    const cost = Number(productToEdit.costPrice);

    if (!productToEdit.name || !productToEdit.category || qty <= 0 || cost <= 0) {
      toast({ title: 'Error', description: 'All fields required and must be valid.', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    setProducts(prev =>
      prev.map(p =>
        p.id === productToEdit.id
          ? {
              ...p,
              name: productToEdit.name.trim(),
              category: productToEdit.category.trim(),
              quantity: qty,
              unit: productToEdit.unit,
              costPrice: cost,
              totalCostPrice: qty * cost,
              expiryDate: productToEdit.expiryDate || undefined,
              lastUpdated: new Date().toISOString(),
            }
          : p
      )
    );

    setEditDialogOpen(false);
    setProductToEdit(null);
    toast({ title: 'Success', description: 'Product updated!' });
    setActionLoading(false);
  };

  const handleDelete = () => {
    if (!productToDelete) return;
    setActionLoading(true);
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    toast({ title: 'Deleted', description: `${productToDelete.name} removed.` });
    setActionLoading(false);
  };

  const handleSell = () => {
    if (!productToSell) return;

    const qty = Number(sellForm.quantity);
    if (qty <= 0 || qty > productToSell.quantity) {
      setSellForm(prev => ({ ...prev, error: `Available: ${productToSell.quantity} ${productToSell.unit}` }));
      return;
    }
    if (Number(sellForm.sellingPrice) <= 0) {
      setSellForm(prev => ({ ...prev, error: 'Enter valid selling price' }));
      return;
    }
    if (sellForm.paymentMethod === 'Credit' && (!sellForm.customerName?.trim() || !sellForm.customerPhone?.trim())) {
      setSellForm(prev => ({ ...prev, error: 'Customer name & phone required for credit' }));
      return;
    }

    setActionLoading(true);
    setProducts(prev =>
      prev.map(p =>
        p.id === productToSell.id
          ? { ...p, quantity: p.quantity - qty, lastUpdated: new Date().toISOString() }
          : p
      )
    );

    setSellDialogOpen(false);
    setProductToSell(null);
    setSellForm({
      quantity: '',
      sellingPrice: '',
      paymentMethod: 'Paid',
      customerName: '',
      customerPhone: '',
      error: '',
      totalAmount: 0,
    });
    toast({ title: 'Sold!', description: `Sold ${qty} ${productToSell.unit}` });
    setActionLoading(false);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage products easily</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-white dark:bg-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table - No background, clean white */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Quantity</TableHead>
              <TableHead className="font-bold">Cost Price</TableHead>
              <TableHead className="font-bold">Total Cost</TableHead>
              <TableHead className="font-bold">Expiry</TableHead>
              <TableHead className="font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-none">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge variant={product.quantity < 10 ? 'destructive' : 'secondary'}>
                    {product.quantity} {product.unit}
                  </Badge>
                </TableCell>
                <TableCell>{formatAmount(product.costPrice)}</TableCell>
                <TableCell>{formatAmount(product.totalCostPrice)}</TableCell>
                <TableCell>{formatDate(product.expiryDate)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProductToEdit(product);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setProductToDelete(product);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setProductToSell(product);
                        setSellForm({
                          quantity: '',
                          sellingPrice: '',
                          paymentMethod: 'Paid',
                          customerName: '',
                          customerPhone: '',
                          error: '',
                          totalAmount: 0,
                        });
                        setSellDialogOpen(true);
                      }}
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> Sell
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">No products found</div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Product Name</Label><Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantity</Label><Input type="number" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} /></div>
              <div><Label>Unit</Label>
                <Select value={newProduct.unit} onValueChange={v => setNewProduct({ ...newProduct, unit: v as 'kg' | 'pcs' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pcs">pcs</SelectItem><SelectItem value="kg">kg</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Cost Price (RWF)</Label><Input type="number" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={newProduct.expiryDate} onChange={e => setNewProduct({ ...newProduct, expiryDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProduct} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {productToEdit && (
            <div className="grid gap-4 py-4">
              <div><Label>Name</Label><Input value={productToEdit.name} onChange={e => setProductToEdit({ ...productToEdit, name: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={productToEdit.category} onChange={e => setProductToEdit({ ...productToEdit, category: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantity</Label><Input type="number" value={productToEdit.quantity} onChange={e => setProductToEdit({ ...productToEdit, quantity: Number(e.target.value) || 0 })} /></div>
                <div><Label>Unit</Label>
                  <Select value={productToEdit.unit} onValueChange={v => setProductToEdit({ ...productToEdit, unit: v as 'kg' | 'pcs' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pcs">pcs</SelectItem><SelectItem value="kg">kg</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Cost Price</Label><Input type="number" value={productToEdit.costPrice} onChange={e => setProductToEdit({ ...productToEdit, costPrice: Number(e.target.value) || 0 })} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={productToEdit.expiryDate || ''} onChange={e => setProductToEdit({ ...productToEdit, expiryDate: e.target.value || undefined })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProduct} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sell: {productToSell?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Available: <strong>{productToSell?.quantity} {productToSell?.unit}</strong></p>
            <div><Label>Quantity</Label><Input type="number" value={sellForm.quantity} onChange={e => setSellForm({ ...sellForm, quantity: Number(e.target.value) || '', error: '' })} /></div>
            <div><Label>Selling Price</Label><Input type="number" value={sellForm.sellingPrice} onChange={e => setSellForm({ ...sellForm, sellingPrice: Number(e.target.value) || '', error: '' })} /></div>
            {sellForm.totalAmount > 0 && <p className="font-bold text-lg">Total: {formatAmount(sellForm.totalAmount)}</p>}
            <div><Label>Payment</Label>
              <Select value={sellForm.paymentMethod} onValueChange={v => setSellForm({ ...sellForm, paymentMethod: v as 'Paid' | 'Credit', error: '' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Credit">Credit</SelectItem></SelectContent>
              </Select>
            </div>
            {sellForm.paymentMethod === 'Credit' && (
              <>
                <div><Label>Customer Name</Label><Input value={sellForm.customerName} onChange={e => setSellForm({ ...sellForm, customerName: e.target.value })} /></div>
                <div><Label>Phone Number</Label><Input value={sellForm.customerPhone} onChange={e => setSellForm({ ...sellForm, customerPhone: e.target.value })} /></div>
              </>
            )}
            {sellForm.error && <p className="text-red-500 text-sm">{sellForm.error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSell} disabled={actionLoading || !!sellForm.error || sellForm.quantity === '' || sellForm.sellingPrice === ''}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{productToDelete?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsStorePage;