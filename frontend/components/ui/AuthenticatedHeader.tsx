'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, Home, FolderKanban, Users, CheckSquare, Calendar, Plus, Settings, Bell, Search } from 'lucide-react';
import { authUtils, authApi } from '@/lib/api';
import SearchModal from './SearchModal';

interface UserData {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  subscription_tier: string;
}

export default function AuthenticatedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!authUtils.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const response = await authApi.me();
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    authUtils.removeToken();
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  if (loading) {
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

  return (
    <header className="bg-blue-900 text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Hamburger */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-semibold hidden sm:inline">AdjustFlow</span>
            </Link>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/boards"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/boards')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Boards
            </Link>
            <Link
              href="/contacts"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/contacts')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Contacts
            </Link>
            <Link
              href="/tasks"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/tasks')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Tasks
            </Link>
            <Link
              href="/calendar"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/calendar')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Calendar
            </Link>
          </nav>

          {/* Right Side - Add Button, Search, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {/* Universal Add Button */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="bg-white text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center"
                title="Add"
              >
                <Plus className="h-5 w-5" />
              </button>
              
              {isAddMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsAddMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                    <Link
                      href="/contacts/new"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAddMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      Add Contact
                    </Link>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        // This will be handled by the page that includes the modal
                        window.location.href = '/dashboard';
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Add Task
                    </button>
                    <Link
                      href="/boards?create=true"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAddMenuOpen(false)}
                    >
                      <FolderKanban className="h-4 w-4" />
                      Add Board
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Search - Desktop */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-blue-100 hover:bg-blue-800 rounded-lg transition-colors w-80"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm text-blue-200 flex-1 text-left">Search for a job, contact, or anything else</span>
              <span className="text-xs text-blue-300 bg-blue-700 px-1.5 py-0.5 rounded">Ctrl K</span>
            </button>
            
            {/* Search - Mobile */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile */}
            {user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-sm font-medium hover:bg-blue-700 transition-colors"
                  title={user.full_name || user.username}
                >
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div className="lg:hidden border-t border-blue-800 bg-blue-900">
              <nav className="flex flex-col py-2">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/boards"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/boards')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FolderKanban className="h-5 w-5" />
                  Boards
                </Link>
                <Link
                  href="/contacts"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/contacts')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  Contacts
                </Link>
                <Link
                  href="/tasks"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/tasks')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CheckSquare className="h-5 w-5" />
                  Tasks
                </Link>
                <Link
                  href="/calendar"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/calendar')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  Calendar
                </Link>
                <div className="border-t border-blue-800 my-2"></div>
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

