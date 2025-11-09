import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart2,
  Package,
  ShoppingCart,
  ArchiveRestore,
  User,
  FileText,
  Trash2,
  Store,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// 🔹 Sidebar items in Kinyarwanda
const sidebarItems = [
  { icon: BarChart2, label: 'Ibikorwa By’Ubucuruzi', path: '/dashboard' },
  { icon: Package, label: 'Ibicuruzwa Muri Stock', path: '/products' },
  { icon: ShoppingCart, label: 'Ibicuruzwa Byagurishijwe', path: '/products-sold' },
  { icon: User, label: 'Umwirondoro Wanjye', path: '/profile' },
  { icon: FileText, label: 'Raporo', path: '/reports' },
  { icon: Trash2, label: 'Byasibwe', path: '/trash' },
  { icon: Store, label: 'Gucunga Amashami', path: '/manage-branch' },
  { icon: Users, label: 'Gucunga Abakozi', path: '/manage-employees' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, className }) => {
  const { logout, user } = useAuth();

  const fullName =
    user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'OF';
  const profileImage = user?.profileImage || '';

  return (
    <div
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        'h-screen',
        'sticky top-0 left-0 z-40',
        className
      )}
    >
      {/* 🔹 Header with logo icon */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border min-h-[60px] flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <Package className="text-white" size={20} /> {/* Stock icon as logo */}
            </div>
            <span className="font-semibold text-sidebar-foreground text-sm">
              StockWise
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1.5 h-auto w-auto"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-2 py-2 rounded-md transition-colors text-sm',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  collapsed ? 'justify-center' : 'space-x-2'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 🔹 Upgrade Banner */}
        {!collapsed && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-blue-500 to-blue-400 text-white p-4 mt-6 shadow-md">
            <div className="absolute inset-0 opacity-10 bg-[url('/patterns/dots.svg')] bg-cover" />
            <div className="relative z-10 text-center">
              <Star className="mx-auto mb-2" size={22} />
              <h4 className="font-semibold text-sm">Kora Upgrade yawe 📈</h4>
              <p className="text-xs text-blue-100 mt-1 mb-3">
                Fata version yisumbuye kugira ngo ubone ubushobozi burenze bwo gucunga ubucuruzi bwawe.
              </p>
              <NavLink to="/upgrade-plan">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-md"
                >
                  Fungura Paketi Nshya
                </Button>
              </NavLink>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* 🔹 User Info & Logout */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        {!collapsed && user && (
          <div className="flex items-center space-x-2 mb-2 p-2">
            <Avatar className="w-6 h-6 overflow-hidden">
              <AvatarImage src={profileImage} className="object-cover w-full h-full" />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {fullName || 'Umukoresha'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role || 'Inshingano'}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            'w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm',
            collapsed ? 'justify-center px-2' : 'justify-start space-x-2 px-2'
          )}
          title={collapsed ? 'Sohoka' : undefined}
        >
          <LogOut size={14} />
          {!collapsed && <span>Sohoka</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
