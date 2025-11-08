import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, DollarSign, Loader2, ArrowUpDown } from 'lucide-react';
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

interface SoldProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'pcs';
  costPrice: number;
  sellingPrice: number;
  soldDate: string;
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  paymentStatus: 'Paid' | 'Unpaid';
  amountPaid: number;
  totalAmount: number;
  remaining: number;
  branch: string;
}

const mockSoldProducts: SoldProduct[] = [
  {
    id: '1',
    name: 'Macbook Pro',
    category: 'Electronics',
    quantity: 5,
    unit: 'pcs',
    costPrice: 1200000,
    sellingPrice: 1500000,
    soldDate: '2025-10-20',
    customerName: 'Alice',
    customerPhone: '+250781234567',
    dueDate: '2025-11-20',
    paymentStatus: 'Paid',
    amountPaid: 7500000,
    totalAmount: 7500000,
    remaining: 0,
    branch: 'Main Branch',
  },
  {
    id: '2',
    name: 'Organic Rice',
    category: 'Groceries',
    quantity: 50,
    unit: 'kg',
    costPrice: 5000,
    sellingPrice: 7000,
    soldDate: '2025-10-15',
    customerName: 'Jane Doe',
    customerPhone: '+250789123456',
    dueDate: '2025-11-20',
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    totalAmount: 350000,
    remaining: 350000,
    branch: 'Downtown Branch',
  },
  {
    id: '3',
    name: 'T-Shirt',
    category: 'Clothing',
    quantity: 10,
    unit: 'pcs',
    costPrice: 10000,
    sellingPrice: 15000,
    soldDate: '2025-10-10',
    customerName: 'John Smith',
    customerPhone: '+250788987654',
    dueDate: '2025-11-10',
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    totalAmount: 150000,
    remaining: 150000,
    branch: 'Main Branch',
  },
];

const ProductsSoldPage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<SoldProduct[]>(mockSoldProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'remaining'>('date');

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SoldProduct | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const formatAmount = (amount: number) => `RWF ${amount.toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-RW');

  const branches = ['All', ...new Set(products.map(p => p.branch))];
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredAndSorted = products
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )
    .filter(p => statusFilter === 'All' || p.paymentStatus === statusFilter)
    .filter(p => branchFilter === 'All' || p.branch === branchFilter)
    .filter(p => categoryFilter === 'All' || p.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime();
      if (sortBy === 'status') return a.paymentStatus === 'Unpaid' ? -1 : 1;
      if (sortBy === 'remaining') return b.remaining - a.remaining;
      return 0;
    });

  const totalProfit = filteredAndSorted.reduce((sum, p) => {
    return sum + (p.sellingPrice - p.costPrice) * p.quantity;
  }, 0);

  const handlePayNow = (product: SoldProduct) => {
    if (product.remaining <= 0) return;
    setSelectedProduct(product);
    setPaymentAmount('');
    setPaymentError('');
    setPaymentDialogOpen(true);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaymentAmount(val);
    const num = Number(val);
    if (!selectedProduct) return;

    if (val === '') setPaymentError('');
    else if (num <= 0) setPaymentError('Amount must be > 0');
    else if (num > selectedProduct.remaining) setPaymentError(`Max: ${formatAmount(selectedProduct.remaining)}`);
    else setPaymentError('');
  };

  const confirmPayment = () => {
    if (!selectedProduct || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (amount <= 0 || amount > selectedProduct.remaining) return;

    setActionLoading(true);
    setProducts(prev =>
      prev.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              amountPaid: p.amountPaid + amount,
              remaining: p.remaining - amount,
              paymentStatus: p.remaining - amount === 0 ? 'Paid' : 'Unpaid',
            }
          : p
      )
    );

    toast({ title: 'Payment Recorded', description: `${formatAmount(amount)} received` });
    setPaymentDialogOpen(false);
    setSelectedProduct(null);
    setPaymentAmount('');
    setActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Sold Products</h1>
        <p className="text-gray-500 mt-1">Track credit & payments</p>
      </div>

      {/* Profit Summary */}
      <div className="mb-8 p-6 border-t-4 border-gray-200">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500">Total Profit</p>
            <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatAmount(totalProfit)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Visible Items</p>
            <p className="text-2xl font-semibold">{filteredAndSorted.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300"
            placeholder="Search..."
          />
        </div>

        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Buttons */}
      <div className="mb-6 flex gap-3">
        <Button
          variant={sortBy === 'date' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('date')}
        >
          <ArrowUpDown className="h-4 w-4 mr-1" /> Date
        </Button>
        <Button
          variant={sortBy === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('status')}
        >
          Status
        </Button>
        <Button
          variant={sortBy === 'remaining' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('remaining')}
        >
          Remaining
        </Button>
      </div>

      {/* Table - Pure White, No Background */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Cat</TableHead>
              <TableHead className="font-semibold">Qty</TableHead>
              <TableHead className="font-semibold">Cost</TableHead>
              <TableHead className="font-semibold">Sell</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Due</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Paid</TableHead>
              <TableHead className="font-semibold text-red-600">Remain</TableHead>
              <TableHead className="font-semibold"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map(p => (
              <TableRow key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.quantity} {p.unit}</TableCell>
                <TableCell>{formatAmount(p.costPrice)}</TableCell>
                <TableCell>{formatAmount(p.sellingPrice)}</TableCell>
                <TableCell>{formatDate(p.soldDate)}</TableCell>
                <TableCell>{p.customerName || '–'}</TableCell>
                <TableCell>{p.customerPhone || '–'}</TableCell>
                <TableCell>{p.dueDate ? formatDate(p.dueDate) : '–'}</TableCell>
                <TableCell>
                  <Badge variant={p.paymentStatus === 'Paid' ? 'default' : 'destructive'}>
                    {p.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{formatAmount(p.amountPaid)}</TableCell>
                <TableCell className="font-bold text-red-600">
                  {p.remaining > 0 ? formatAmount(p.remaining) : '–'}
                </TableCell>
                <TableCell>
                  {p.remaining > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handlePayNow(p)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-lg">No products found</div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <p><strong>Product:</strong> {selectedProduct.name}</p>
                <p><strong>Customer:</strong> {selectedProduct.customerName}</p>
                <p><strong>Total:</strong> {formatAmount(selectedProduct.totalAmount)}</p>
                <p><strong>Paid:</strong> {formatAmount(selectedProduct.amountPaid)}</p>
                <p className="text-red-600 font-bold">
                  Remaining: {formatAmount(selectedProduct.remaining)}
                </p>
              </div>

              <div>
                <Label>Amount (RWF)</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={handlePaymentChange}
                  className="mt-2"
                />
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
                  {paymentError}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmPayment}
              disabled={actionLoading || !paymentAmount || !!paymentError}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsSoldPage;