
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showMessage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className, 
  showMessage = true, 
  message = "" 
  // Please wait, loading may take a few seconds as the server is waking up.
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (showMessage) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={cn("animate-spin rounded-full border-2 border-primary/30 border-t-primary", sizeClasses[size], className)}>
        </div>
        <p className="text-muted-foreground text-sm text-center max-w-xs">{message}</p>
      </div>
    );
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary/30 border-t-primary", sizeClasses[size], className)}>
    </div>
  );
};

export default LoadingSpinner;
