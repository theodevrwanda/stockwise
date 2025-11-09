import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'pcs' | 'kg';
  costPrice: number;
  sellingPrice: number;
  type: 'store' | 'sold' | 'deleted';
  date: string; // added/sold/deleted
  expiry?: string;
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  paymentStatus: 'Paid' | 'Unpaid';
  amountPaid: number;
  totalAmount: number;
  remaining: number;
  branch: string;
}

// MOCK DATA - ALL PRODUCTS MIXED
const mockProducts: Product[] = [
  // SOLD
  {
    id: '1',
    name: 'Macbook Pro',
    category: 'Electronics',
    quantity: 5,
    unit: 'pcs',
    costPrice: 1200000,
    sellingPrice: 1500000,
    type: 'sold',
    date: '2025-10-20',
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
    type: 'sold',
    date: '2025-10-15',
    customerName: 'Jane Doe',
    customerPhone: '+250789123456',
    dueDate: '2025-11-20',
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    totalAmount: 350000,
    remaining: 350000,
    branch: 'Downtown',
  },
  {
    id: '3',
    name: 'T-Shirt',
    category: 'Clothing',
    quantity: 10,
    unit: 'pcs',
    costPrice: 10000,
    sellingPrice: 15000,
    type: 'sold',
    date: '2025-10-10',
    customerName: 'John Smith',
    customerPhone: '+250788987654',
    dueDate: '2025-11-10',
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    totalAmount: 150000,
    remaining: 150000,
    branch: 'Main Branch',
  },
  // STORE
  {
    id: '4',
    name: 'Macbook Pro',
    category: 'Electronics',
    quantity: 50,
    unit: 'pcs',
    costPrice: 1200000,
    sellingPrice: 1500000,
    type: 'store',
    date: '2025-09-01',
    expiry: '2026-12-31',
    paymentStatus: 'Paid',
    amountPaid: 0,
    totalAmount: 0,
    remaining: 0,
    branch: 'Main Branch',
  },
  {
    id: '5',
    name: 'Organic Rice',
    category: 'Groceries',
    quantity: 100,
    unit: 'kg',
    costPrice: 5000,
    sellingPrice: 7000,
    type: 'store',
    date: '2025-08-15',
    expiry: '2026-06-30',
    paymentStatus: 'Paid',
    amountPaid: 0,
    totalAmount: 0,
    remaining: 0,
    branch: 'Downtown',
  },
  // DELETED
  {
    id: '6',
    name: 'Old Phone',
    category: 'Electronics',
    quantity: 3,
    unit: 'pcs',
    costPrice: 800000,
    sellingPrice: 0,
    type: 'deleted',
    date: '2025-07-20',
    paymentStatus: 'Paid',
    amountPaid: 0,
    totalAmount: 0,
    remaining: 0,
    branch: 'Main Branch',
  },
];

const ReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'store' | 'sold' | 'deleted'>('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'status' | 'branch' | 'remaining'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const formatAmount = (n: number) => `RWF ${n.toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-RW');

  const branches = ['All', ...new Set(products.map(p => p.branch))];
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredAndSorted = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'All' || p.type === statusFilter;
      const matchesBranch = branchFilter === 'All' || p.branch === branchFilter;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesBranch && matchesCategory;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'date': aVal = a.date; bVal = b.date; break;
        case 'category': aVal = a.category; bVal = b.category; break;
        case 'status': aVal = a.type; bVal = b.type; break;
        case 'branch': aVal = a.branch; bVal = b.branch; break;
        case 'remaining': aVal = a.remaining; bVal = b.remaining; break;
        default: aVal = a.date; bVal = b.date;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Qty', 'Cost', 'Sell', 'Date', 'Customer', 'Phone', 'Due/Expiry', 'Status', 'Paid', 'Remain'];
    const rows = filteredAndSorted.map(p => [
      p.name,
      p.category,
      `${p.quantity} ${p.unit}`,
      formatAmount(p.costPrice),
      p.type === 'store' ? '–' : formatAmount(p.sellingPrice),
      formatDate(p.date),
      p.customerName || (p.type === 'store' ? '–' : '–'),
      p.customerPhone || '–',
      p.dueDate ? formatDate(p.dueDate) : (p.expiry || '–'),
      p.type === 'store' ? 'Store' : p.type === 'deleted' ? 'Deleted' : p.paymentStatus,
      p.type === 'store' ? '–' : formatAmount(p.amountPaid),
      p.remaining > 0 ? formatAmount(p.remaining) : '–',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'full-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Report saved as CSV' });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Full Inventory Report</h1>
        <p className="text-gray-500 mt-2">Store • Sold • Deleted — All in One Place</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" placeholder="Search..." />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="store">Store</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={exportCSV} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Sort Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {(['date', 'category', 'status', 'branch', 'remaining'] as const).map(field => (
          <Button
            key={field}
            variant={sortBy === field ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort(field)}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field && (sortDir === 'asc' ? ' Up' : ' Down')}
          </Button>
        ))}
      </div>

      {/* Single Clean Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Cat</TableHead>
              <TableHead className="font-bold">Qty</TableHead>
              <TableHead className="font-bold">Cost price</TableHead>
              <TableHead className="font-bold">Sold price</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Due/Expiry</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Paid</TableHead>
              <TableHead className="font-bold text-red-600">Remain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map(p => (
              <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.quantity} {p.unit}</TableCell>
                <TableCell>{formatAmount(p.costPrice)}</TableCell>
                <TableCell>{p.type === 'store' ? '–' : formatAmount(p.sellingPrice)}</TableCell>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell>{p.customerName || (p.type === 'store' ? '–' : '–')}</TableCell>
                <TableCell>{p.customerPhone || '–'}</TableCell>
                <TableCell>{p.dueDate ? formatDate(p.dueDate) : (p.expiry || '–')}</TableCell>
                <TableCell>
                  <Badge variant={
                    p.type === 'store' ? 'secondary' :
                    p.type === 'deleted' ? 'destructive' :
                    p.paymentStatus === 'Paid' ? 'default' : 'outline'
                  }>
                    {p.type === 'store' ? 'Store' : p.type === 'deleted' ? 'Deleted' : p.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{p.type === 'store' ? '–' : formatAmount(p.amountPaid)}</TableCell>
                <TableCell className="font-bold text-red-600">
                  {p.remaining > 0 ? formatAmount(p.remaining) : '–'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-lg">No products found</div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;