import React, { useState } from 'react';
import { Bell, User as UserIcon, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import GlobalSearch from '@/components/GlobalSearch';
import MobileMenu from './MobileMenu';

// Helper function to calculate days remaining until expiry using business plan and end date
const calculateExpiryStatus = (user: any) => {
  // Use fields from the loaded business object
  const rawPlanName = user?.business?.plan || 'Free';
  // Capitalize the plan name for display
  const planName = rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1);
  // This value is the endDate retrieved from Firestore via the AuthProvider
  const subscriptionEndDate = user?.business?.endDate; 

  // Handle Free Plan explicitly
  if (rawPlanName.toLowerCase() === 'free') {
    // If it's a free plan, we might show "Free Plan" or a specific trial end date if applicable
    return 'Free Plan';
  }

  // Handle Paid Plans
  if (!subscriptionEndDate) {
    // Fallback if a paid plan is active but no end date is found
    return `${planName} Plan`;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // subscriptionEndDate is a Date object thanks to AuthProvider's mapping
    const end = new Date(subscriptionEndDate);
    end.setHours(0, 0, 0, 0);

    // Calculate time difference in days
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const daysText = diffDays === 1 ? 'day' : 'days';
      return `${planName} Plan (${diffDays} ${daysText} left)`;
    } else if (diffDays === 0) {
      return `${planName} Plan (Expires today!)`;
    } else {
      // Negative days remaining
      return `${planName} Plan (Expired)`;
    }
  } catch (error) {
    console.error("Error calculating expiry date:", error);
    return `${planName} Plan (Error)`;
  }
};

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive fullName from firstName and lastName if fullName is not directly available
  const fullName =
    user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  // Generate initials for AvatarFallback
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'OF';

  // Use profileImage from user object, which is mapped from photo in backend
  const profileImage = user?.profileImage || '';

  // Calculate the plan status text
  const planStatusText = calculateExpiryStatus(user);

  return (
    <>
      <header
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-sm"
      >
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2"
          >
            <Menu size={20} />
          </Button>

          {/* Global Search */}
          <GlobalSearch />

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell size={20} />
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 overflow-hidden">
                <AvatarImage src={profileImage} className="object-cover w-full h-full" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {user && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {fullName || 'User'}
                  </p>
                  {/* UPDATED: Display Plan Status and Expiry */}
                  <p className="text-xs text-blue-600 dark:text-blue-500 font-semibold">
                    {planStatusText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;