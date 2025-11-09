import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Trash2, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeletedProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'pcs' | 'kg';
  costPrice: number;
  sellingPrice: number;
  originalType: 'sold' | 'store';
  date: string; // sold/added date
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  expiry?: string;
  paymentStatus: 'Paid' | 'Unpaid';
  amountPaid: number;
  totalAmount: number;
  remaining: number;
  branch: string;
  deletedDate: string;
}

// MOCK DELETED PRODUCTS – FULL LIKE SOLD & STORE (NO REASON)
const mockDeletedProducts: DeletedProduct[] = [
  {
    id: 'd1',
    name: 'Macbook Pro',
    category: 'Electronics',
    quantity: 2,
    unit: 'pcs',
    costPrice: 1200000,
    sellingPrice: 1500000,
    originalType: 'sold',
    date: '2025-10-15',
    customerName: 'Alice',
    customerPhone: '+250781234567',
    dueDate: '2025-11-15',
    paymentStatus: 'Unpaid',
    amountPaid: 1000000,
    totalAmount: 3000000,
    remaining: 2000000,
    branch: 'Main Branch',
    deletedDate: '2025-10-20',
  },
  {
    id: 'd2',
    name: 'Organic Rice',
    category: 'Groceries',
    quantity: 100,
    unit: 'kg',
    costPrice: 5000,
    sellingPrice: 7000,
    originalType: 'store',
    date: '2025-08-01',
    expiry: '2025-12-31',
    paymentStatus: 'Paid',
    amountPaid: 0,
    totalAmount: 0,
    remaining: 0,
    branch: 'Downtown',
    deletedDate: '2025-10-10',
  },
  {
    id: 'd3',
    name: 'T-Shirt',
    category: 'Clothing',
    quantity: 20,
    unit: 'pcs',
    costPrice: 10000,
    sellingPrice: 15000,
    originalType: 'sold',
    date: '2025-09-25',
    customerName: 'John Smith',
    customerPhone: '+250788987654',
    dueDate: '2025-10-25',
    paymentStatus: 'Paid',
    amountPaid: 300000,
    totalAmount: 300000,
    remaining: 0,
    branch: 'Main Branch',
    deletedDate: '2025-10-05',
  },
];

const TrashPage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<DeletedProduct[]>(mockDeletedProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSelectedConfirmOpen, setIsDeleteSelectedConfirmOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<DeletedProduct | null>(null);

  const isAdmin = true;

  const formatAmount = (n: number) => `RWF ${n.toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-RW');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRestoreProduct = (id: string) => {
    setActionLoading(true);
    setTimeout(() => {
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedProducts(prev => prev.filter(x => x !== id));
      toast({ title: 'Restored', description: 'Product back in inventory' });
      setActionLoading(false);
    }, 800);
  };

  const handleRestoreSelected = () => {
    if (selectedProducts.length === 0) return;
    setActionLoading(true);
    setTimeout(() => {
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      toast({ title: 'Restored', description: `${selectedProducts.length} items restored` });
      setActionLoading(false);
    }, 1000);
  };

  const handleRestoreAll = () => {
    if (products.length === 0) return;
    setActionLoading(true);
    setTimeout(() => {
      setProducts([]);
      setSelectedProducts([]);
      toast({ title: 'All Restored', description: 'Trash is empty' });
      setActionLoading(false);
    }, 1200);
  };

  const openDeleteConfirm = (id: string) => {
    setProductToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handlePermanentDelete = () => {
    if (!productToDelete) return;
    setActionLoading(true);
    setTimeout(() => {
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setSelectedProducts(prev => prev.filter(x => x !== productToDelete));
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      toast({ title: 'Deleted Forever', description: 'Gone permanently' });
      setActionLoading(false);
    }, 800);
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    setIsDeleteSelectedConfirmOpen(true);
  };

  const confirmDeleteSelected = () => {
    setActionLoading(true);
    setTimeout(() => {
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      setIsDeleteSelectedConfirmOpen(false);
      toast({ title: 'Deleted', description: `${selectedProducts.length} items removed forever` });
      setActionLoading(false);
    }, 1000);
  };

  const openDetails = (p: DeletedProduct) => {
    setCurrentProduct(p);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Trash</h1>
        <p className="text-gray-500 mt-2">Deleted products – full details, restore or delete forever</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={handleRestoreAll} disabled={products.length === 0 || actionLoading} className="bg-green-600">
          {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Restore All
        </Button>
        <Button onClick={handleRestoreSelected} disabled={selectedProducts.length === 0 || actionLoading} className="bg-blue-600">
          Restore Selected ({selectedProducts.length})
        </Button>
        {isAdmin && (
          <Button onClick={handleDeleteSelected} variant="destructive" disabled={selectedProducts.length === 0 || actionLoading}>
            Delete Forever
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, customer, branch..."
          className="pl-10"
        />
      </div>

      {/* Full Table – SAME AS REPORTS (NO REASON COLUMN) */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={() => {
                    setSelectedProducts(
                      selectedProducts.length === filteredProducts.length
                        ? []
                        : filteredProducts.map(p => p.id)
                    );
                  }}
                />
              </TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Cat</TableHead>
              <TableHead className="font-bold">Qty</TableHead>
              <TableHead className="font-bold">Cost</TableHead>
              <TableHead className="font-bold">Sell</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Due/Expiry</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Paid</TableHead>
              <TableHead className="font-bold text-red-600">Remain</TableHead>
              <TableHead className="font-bold">Branch</TableHead>
              <TableHead className="font-bold">Deleted On</TableHead>
              <TableHead className="font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(p => (
              <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(p.id)}
                    onCheckedChange={() => handleSelectProduct(p.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.quantity} {p.unit}</TableCell>
                <TableCell>{formatAmount(p.costPrice)}</TableCell>
                <TableCell>{formatAmount(p.sellingPrice)}</TableCell>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell>{p.customerName || '–'}</TableCell>
                <TableCell>{p.customerPhone || '–'}</TableCell>
                <TableCell>{p.dueDate ? formatDate(p.dueDate) : (p.expiry || '–')}</TableCell>
                <TableCell>
                  <Badge variant={p.paymentStatus === 'Paid' ? 'default' : 'destructive'}>
                    {p.originalType === 'store' ? 'Store' : p.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{formatAmount(p.amountPaid)}</TableCell>
                <TableCell className="font-bold text-red-600">
                  {p.remaining > 0 ? formatAmount(p.remaining) : '–'}
                </TableCell>
                <TableCell>{p.branch}</TableCell>
                <TableCell>{formatDate(p.deletedDate)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openDetails(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleRestoreProduct(p.id)} className="bg-green-600 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button size="sm" variant="destructive" onClick={() => openDeleteConfirm(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-lg">
            {products.length === 0 ? 'Trash is empty' : 'No items match your search'}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentProduct?.name}</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Category:</strong> {currentProduct.category}</div>
              <div><strong>Quantity:</strong> {currentProduct.quantity} {currentProduct.unit}</div>
              <div><strong>Cost:</strong> {formatAmount(currentProduct.costPrice)}</div>
              <div><strong>Sell:</strong> {formatAmount(currentProduct.sellingPrice)}</div>
              <div><strong>Original:</strong> <Badge>{currentProduct.originalType === 'sold' ? 'Sold' : 'Store'}</Badge></div>
              <div><strong>Branch:</strong> {currentProduct.branch}</div>
              <div><strong>Customer:</strong> {currentProduct.customerName || '–'}</div>
              <div><strong>Phone:</strong> {currentProduct.customerPhone || '–'}</div>
              <div><strong>Due/Expiry:</strong> {currentProduct.dueDate ? formatDate(currentProduct.dueDate) : (currentProduct.expiry || '–')}</div>
              <div><strong>Status:</strong> <Badge variant={currentProduct.paymentStatus === 'Paid' ? 'default' : 'destructive'}>{currentProduct.paymentStatus}</Badge></div>
              <div><strong>Paid:</strong> {formatAmount(currentProduct.amountPaid)}</div>
              <div><strong>Remaining:</strong> <span className="text-red-600 font-bold">{currentProduct.remaining > 0 ? formatAmount(currentProduct.remaining) : '–'}</span></div>
              <div className="col-span-2"><strong>Deleted On:</strong> {formatDate(currentProduct.deletedDate)}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialogs */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Permanently Delete?</DialogTitle></DialogHeader>
          <DialogDescription>Cannot be undone.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handlePermanentDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteSelectedConfirmOpen} onOpenChange={setIsDeleteSelectedConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {selectedProducts.length} Items Forever?</DialogTitle></DialogHeader>
          <DialogDescription>No recovery.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSelectedConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteSelected} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrashPage;