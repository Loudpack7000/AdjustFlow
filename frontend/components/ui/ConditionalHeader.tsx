'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authUtils } from '@/lib/api';
import AuthenticatedHeader from './AuthenticatedHeader';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch - show loading state during SSR
  if (!mounted) {
    return (
      <header className="bg-blue-900 text-white shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-32 h-8 bg-blue-800 rounded animate-pulse"></div>
            <div className="w-32 h-8 bg-blue-800 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }
  
  // Pages that should show the landing page header
  const landingPages = ['/', '/login', '/signup'];
  
  // Show landing page header for these routes
  if (landingPages.includes(pathname || '')) {
    return <Header />;
  }
  
  // Use AuthenticatedHeader for all authenticated routes
  const isAuthenticated = authUtils.isAuthenticated();
  if (isAuthenticated) {
    return <AuthenticatedHeader />;
  }
  
  // Fallback to regular header
  return <Header />;
}
