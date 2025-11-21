'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ChevronDown, Home, Shield, HardHat, Wrench, Building2, Briefcase } from 'lucide-react';
import ApiStatus from '@/components/ApiStatus';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWhoWeServeOpen, setIsWhoWeServeOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (pathname !== '/') {
      // Not on landing page, navigate first
      router.push(`/#${sectionId}`);
      // Wait for navigation and page load, then scroll
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 500);
    } else {
      // Already on landing page, just scroll
      scrollToSection(sectionId);
    }
    
    setIsMenuOpen(false);
    setIsWhoWeServeOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation when landing page loads
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(hash);
      }, 300); // Wait for page to render
    }
  }, [pathname]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                AdjustFlow
              </span>
            </Link>
            <ApiStatus className="hidden sm:inline-flex bg-slate-100/80 backdrop-blur-sm" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={(e) => handleSectionClick(e, 'features')}
            >
              Features
            </a>
            
            {/* Who We Serve Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsWhoWeServeOpen(true)}
              onMouseLeave={() => setIsWhoWeServeOpen(false)}
            >
              <a 
                href="#who-we-serve" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                onClick={(e) => handleSectionClick(e, 'who-we-serve')}
              >
                Who We Serve
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isWhoWeServeOpen ? 'rotate-180' : ''}`} />
              </a>
              
              {isWhoWeServeOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[800px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Roofing Contractors */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Home className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Roofing Contractors
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Manage roofing projects, track estimates, coordinate with adjusters, and maintain customer relationships.
                        </p>
                      </div>
                    </a>

                    {/* Insurance Adjusters */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Insurance Adjusters
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Streamline claim processing, document management, and communication with contractors and policyholders.
                        </p>
                      </div>
                    </a>

                    {/* Construction Companies */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HardHat className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Construction Companies
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Coordinate projects, manage subcontractors, track progress, and maintain client relationships.
                        </p>
                      </div>
                    </a>

                    {/* Restoration Companies */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Restoration Companies
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Handle emergency response projects, manage insurance claims, and coordinate with multiple stakeholders.
                        </p>
                      </div>
                    </a>

                    {/* Property Management */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Property Management
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Manage properties, track maintenance, coordinate vendors, and maintain tenant relationships.
                        </p>
                      </div>
                    </a>

                    {/* General Contractors */}
                    <a
                      href="#who-we-serve"
                      className="group flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          General Contractors
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Oversee multiple projects, manage teams, track budgets, and maintain client satisfaction.
                        </p>
                      </div>
                    </a>
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href="#who-we-serve"
                      className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={(e) => handleSectionClick(e, 'who-we-serve')}
                    >
                      View all industries we serve
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <a 
              href="#faq" 
              className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={(e) => handleSectionClick(e, 'faq')}
            >
              FAQ
            </a>
            
            <Link 
              href="/about" 
              className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            
            <Link 
              href="/contact" 
              className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
            
            <Link 
              href="/login" 
              className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/30">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={(e) => handleSectionClick(e, 'features')}
              >
                Features
              </a>
              <a 
                href="#who-we-serve" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={(e) => handleSectionClick(e, 'who-we-serve')}
              >
                Who We Serve
              </a>
              <a 
                href="#faq" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={(e) => handleSectionClick(e, 'faq')}
              >
                FAQ
              </a>
              <Link 
                href="/about" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/login" 
                className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}





