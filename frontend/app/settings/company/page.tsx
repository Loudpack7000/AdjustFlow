'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Upload, X, Save } from 'lucide-react';
import { companyApi, authUtils, authApi } from '@/lib/api';

interface Company {
  id: number;
  name: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  status: string;
}

interface UserData {
  id: number;
  is_superuser: boolean;
}

export default function CompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      try {
        const userResponse = await authApi.me();
        console.log('User response data:', userResponse.data);
        console.log('is_superuser value:', userResponse.data.is_superuser);
        setUser(userResponse.data);
        
        if (!userResponse.data.is_superuser) {
          console.error('Access denied - is_superuser is:', userResponse.data.is_superuser);
          alert('Only administrators can access company settings');
          router.back();
          return;
        }
        
        loadCompany();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const response = await companyApi.get();
      const companyData = response.data;
      setCompany(companyData);
      
      // Populate form
      setName(companyData.name || '');
      setAddressLine1(companyData.address_line_1 || '');
      setAddressLine2(companyData.address_line_2 || '');
      setCity(companyData.city || '');
      setState(companyData.state || '');
      setPostalCode(companyData.postal_code || '');
      setPhone(companyData.phone || '');
      setEmail(companyData.email || '');
      setWebsite(companyData.website || '');
      setPrimaryColor(companyData.primary_color || '#3B82F6');
      setSecondaryColor(companyData.secondary_color || '#8B5CF6');
      setLogoUrl(companyData.logo_url || '');
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      setSaving(true);
      const response = await companyApi.update({
        name,
        address_line_1: addressLine1 || undefined,
        address_line_2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl || undefined
      });
      
      setCompany(response.data);
      alert('Company information saved successfully');
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await companyApi.uploadLogo(file);
      setLogoUrl(response.data.logo_url);
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to upload logo');
    }
  };

  const handleResetColors = () => {
    setPrimaryColor('#3B82F6');
    setSecondaryColor('#8B5CF6');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.is_superuser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Information</h1>
              <p className="text-gray-600">Manage your company details and branding</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Company Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          </div>

          {/* Logo Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img 
                    src={logoUrl} 
                    alt="Company logo" 
                    className="h-20 object-contain"
                  />
                  <button
                    onClick={() => setLogoUrl('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Upload logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended size: 150 x 40</p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Branding Colors */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Branding Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary/Header Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleResetColors}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Reset logo and color
            </button>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded ${
                company?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {company?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

