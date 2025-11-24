'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Phone, Mail, MoreVertical, Eye, Edit, Copy, MessageSquare, Paperclip, CheckSquare, Trash2, Upload, ChevronUp, ChevronDown, Filter, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { contactsApi } from '@/lib/api';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  email?: string;
  main_phone?: string;
  mobile_phone?: string;
  company?: string;
  contact_type?: string;
  status?: string;
  sales_rep_id?: number;
  sales_rep_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  address_info?: string;
  full_name: string;
}

type SortField = 'display_name' | 'type' | 'status' | 'sales_rep' | 'address_info' | null;
type SortOrder = 'asc' | 'desc';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchContacts();
    }
  }, [searchQuery, sortBy, sortOrder, statusFilter, typeFilter, mounted]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsApi.list(
        searchQuery || undefined,
        sortBy || undefined,
        sortBy ? sortOrder : undefined
      );
      let filteredContacts = response.data;
      
      // Apply client-side filters
      if (statusFilter !== 'all') {
        filteredContacts = filteredContacts.filter(c => c.status === statusFilter);
      }
      if (typeFilter !== 'all') {
        filteredContacts = filteredContacts.filter(c => c.contact_type === typeFilter);
      }
      
      setContacts(filteredContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter dropdowns
  const getUniqueStatuses = () => {
    const statuses = new Set<string>();
    // We'd need to fetch all contacts to get unique statuses, or store them separately
    // For now, return common statuses
    return ['all', 'Active', 'Inactive', 'Lead', 'Customer', 'Prospect'];
  };

  const getUniqueTypes = () => {
    const types = new Set<string>();
    // Similar to statuses
    return ['all', 'Client', 'Vendor', 'Insurance Company', 'Contractor'];
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return null;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline-block ml-1" />
    );
  };

  const handleViewContact = (contactId: number) => {
    router.push(`/contacts/${contactId}`);
  };

  const handleEditContact = (contactId: number) => {
    router.push(`/contacts/${contactId}/edit`);
  };

  const handleDuplicateContact = async (contactId: number) => {
    try {
      const response = await contactsApi.duplicate(contactId);
      if (response.data?.id) {
        router.push(`/contacts/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Error duplicating contact:', error);
      alert(error?.response?.data?.detail || 'Failed to duplicate contact');
    }
  };

  const handleAddNote = (contactId: number) => {
    router.push(`/contacts/${contactId}?tab=activity`);
  };

  const handleSendMessage = (contactId: number) => {
    alert('Send message functionality will be implemented soon');
    // TODO: Implement send message
  };

  const handleAddAttachment = (contactId: number) => {
    router.push(`/contacts/${contactId}?tab=documents`);
  };

  const handleAddTask = (contactId: number) => {
    router.push(`/contacts/${contactId}?tab=tasks`);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingContactId(contactId);
      await contactsApi.delete(contactId.toString());
      // Refresh the contacts list
      fetchContacts();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to delete contact. Please try again.';
      alert(errorMessage);
    } finally {
      setDeletingContactId(null);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="mt-2 text-gray-600">Manage your contacts and customer relationships</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/contacts/import')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-5 w-5" />
                Import Contacts
              </button>
              <button
                onClick={() => router.push('/contacts/new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {(statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            
            {showFilters && (
              <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-lg border border-gray-200">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Lead">Lead</option>
                    <option value="Customer">Customer</option>
                    <option value="Prospect">Prospect</option>
                  </select>
                </div>
                
                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Insurance Company">Insurance Company</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>
                
                {/* Clear Filters */}
                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first contact'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/contacts/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Contact
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('display_name')}
                    >
                      <div className="flex items-center">
                        Display Name
                        {getSortIcon('display_name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('sales_rep')}
                    >
                      <div className="flex items-center">
                        Sales Rep
                        {getSortIcon('sales_rep')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('address_info')}
                    >
                      <div className="flex items-center">
                        Address Info
                        {getSortIcon('address_info')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                    <tr
                  key={contact.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                      </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                          {contact.full_name}
                            </div>
                          {contact.email && (
                              <div className="text-sm text-gray-500">{contact.email}</div>
                          )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.contact_type || '-'}
                      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contact.status ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                            {contact.status}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.sales_rep_name || '-'}
                      </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {contact.address_info || '-'}
                    </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button 
                              className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenu.Trigger>
                          
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              className="min-w-[200px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
                              align="end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleViewContact(contact.id)}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </DropdownMenu.Item>
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleEditContact(contact.id)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenu.Item>
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleDuplicateContact(contact.id)}
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </DropdownMenu.Item>

                              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleAddNote(contact.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                                Add Note
                              </DropdownMenu.Item>
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleSendMessage(contact.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                                Send Text Message
                              </DropdownMenu.Item>
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleAddAttachment(contact.id)}
                              >
                                <Paperclip className="h-4 w-4" />
                                Add Attachment
                              </DropdownMenu.Item>
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                                onSelect={() => handleAddTask(contact.id)}
                              >
                                <CheckSquare className="h-4 w-4" />
                                Add Task
                              </DropdownMenu.Item>

                              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                              
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer outline-none"
                                onSelect={() => handleDeleteContact(contact.id)}
                                disabled={deletingContactId === contact.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingContactId === contact.id ? 'Deleting...' : 'Delete'}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

