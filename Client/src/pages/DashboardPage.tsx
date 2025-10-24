import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, Users, Store, DollarSign, ShoppingCart, AlertTriangle, XCircle, 
  TrendingUp, BarChart, CreditCard, TrendingDown, PackagePlus, Star, 
  ArrowUpCircle, ArrowDownCircle, PlusCircle 
} from 'lucide-react';

// Interface for dashboard statistics
interface DashboardStats {
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

// Mock data for the dashboard
const mockStats: DashboardStats = {
  totalProducts: 1500,
  totalEmployees: 75,
  totalBranches: 5,
  stockValue: 250000,
  soldProducts: 1200,
  expiryProducts: 30,
  deletedProducts: 50,
  totalProfit: 45000,
  totalRevenue: 300000,
  outstandingPayments: 15000,
  loss: 5000,
  mostStockedProduct: { name: 'Macbook Pro', units: 200 },
  leastStockedProduct: { name: 'Samsung Galaxy A15', units: 10 },
  mostSoldProduct: { name: 'iPhone 13 Pro', units: 500 },
  productsAddedThisWeek: 80,
  activeSuppliers: 25,
};

// Utility functions
const formatNumber = (num: number): string => new Intl.NumberFormat('rw-RW').format(num);
const formatCurrency = (num: number): string => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(num);

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard y’Ubucuruzi</h1>
        <p className="text-gray-600 dark:text-gray-400">Amakuru rusange ajyanye n’ubucuruzi bwawe.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Ibicuruzwa byose</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.totalProducts)}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Biri mu bubiko</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Abakozi bose</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.totalEmployees)}</div>
            <p className="text-xs text-green-600 dark:text-green-400">Mu mashami yose</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Amashami yose</CardTitle>
            <Store className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.totalBranches)}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Ahantu hakorera</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Agaciro k’ububiko</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.stockValue)}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Agaciro k’ibicuruzwa biri mu bubiko</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 dark:bg-teal-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-teal-800 dark:text-teal-200">Ibicuruzwa byagurishijwe</CardTitle>
            <ShoppingCart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.soldProducts)}</div>
            <p className="text-xs text-teal-600 dark:text-teal-400">Byagurishijwe</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Ibicuruzwa bigiye kurangira</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.expiryProducts)}</div>
            <p className="text-xs text-red-600 dark:text-red-400">Biri hafi kurangira</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Ibicuruzwa byasibwe</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.deletedProducts)}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Byakuwe muri sisiteme</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Inyungu yose</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalProfit)}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Inyungu y’ubucuruzi</p>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 dark:bg-cyan-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-800 dark:text-cyan-200">Urusobe rw’inyungu</CardTitle>
            <BarChart className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalRevenue)}</div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Amafaranga yose yinjiye</p>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 dark:bg-pink-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-800 dark:text-pink-200">Amafaranga atarishyurwa</CardTitle>
            <CreditCard className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.outstandingPayments)}</div>
            <p className="text-xs text-pink-600 dark:text-pink-400">Abakiriya bagifite amadeni</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 dark:bg-rose-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-200">Igihombo</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.loss)}</div>
            <p className="text-xs text-rose-600 dark:text-rose-400">Igihombo cy’ubucuruzi</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 dark:bg-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Igicuruzwa gifite byinshi</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.mostStockedProduct.name}</div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">{formatNumber(mockStats.mostStockedProduct.units)} ibice</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">Igicuruzwa gike</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.leastStockedProduct.name}</div>
            <p className="text-xs text-amber-600 dark:text-amber-400">{formatNumber(mockStats.leastStockedProduct.units)} ibice</p>
          </CardContent>
        </Card>

        <Card className="bg-lime-50 dark:bg-lime-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-lime-800 dark:text-lime-200">Igicuruzwa cyagurishijwe cyane</CardTitle>
            <Star className="h-4 w-4 text-lime-600 dark:text-lime-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.mostSoldProduct.name}</div>
            <p className="text-xs text-lime-600 dark:text-lime-400">{formatNumber(mockStats.mostSoldProduct.units)} byagurishijwe</p>
          </CardContent>
        </Card>

        <Card className="bg-violet-50 dark:bg-violet-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-violet-800 dark:text-violet-200">Ibicuruzwa byinjiye muri iki cyumweru</CardTitle>
            <PlusCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.productsAddedThisWeek)}</div>
            <p className="text-xs text-violet-600 dark:text-violet-400">Byongewe muri sisiteme</p>
          </CardContent>
        </Card>

        <Card className="bg-fuchsia-50 dark:bg-fuchsia-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-fuchsia-800 dark:text-fuchsia-200">Abatanga ibicuruzwa bakora</CardTitle>
            <PackagePlus className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockStats.activeSuppliers)}</div>
            <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400">Bakorana n’isosiyete</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
