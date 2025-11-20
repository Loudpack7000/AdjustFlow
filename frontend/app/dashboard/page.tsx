'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckSquare, User, Calendar, Clock, Plus, Search, MoreVertical, Eye, Edit, Copy, MessageSquare, Paperclip, CheckSquare as TaskIcon, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { authApi, authUtils, dashboardApi, contactsApi } from '@/lib/api';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

interface UserData {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  subscription_tier: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  due_time_start?: string;
  due_time_end?: string;
  is_all_day: boolean;
  assigned_to_id?: number;
  project_id?: number;
}

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
  address_info?: string;
  full_name: string;
}

type SortField = 'display_name' | 'type' | 'status' | 'sales_rep' | 'address_info' | null;
type SortOrder = 'asc' | 'desc';

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!authUtils.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const [userResponse, dashboardResponse, contactsResponse] = await Promise.all([
          authApi.me(),
          dashboardApi.get(),
          contactsApi.list(undefined, sortBy || undefined, sortBy ? sortOrder : undefined)
        ]);

        setUser(userResponse.data);
        setTasks(dashboardResponse.data.tasks || []);
        setContacts(contactsResponse.data.slice(0, 10)); // Get first 10 for dashboard
        setTaskCount(dashboardResponse.data.task_count || 0);
        setContactCount(dashboardResponse.data.contact_count || 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        authUtils.removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, sortBy, sortOrder]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleViewContact = (contactId: number) => {
    router.push(`/contacts/${contactId}`);
  };

  const handleEditContact = (contactId: number) => {
    router.push(`/contacts/${contactId}/edit`);
  };

  const handleDuplicateContact = (contactId: number) => {
    alert('Duplicate functionality will be implemented soon');
  };

  const handleAddNote = (contactId: number) => {
    router.push(`/contacts/${contactId}?tab=activity`);
  };

  const handleSendMessage = (contactId: number) => {
    alert('Send message functionality will be implemented soon');
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
      // Refresh dashboard data
      const dashboardResponse = await dashboardApi.get();
      setContacts(dashboardResponse.data.contacts || []);
      setContactCount(dashboardResponse.data.contact_count || 0);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setDeletingContactId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-2 text-gray-600">Manage your tasks and contacts</p>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Complete</option>
                  <option value="all">All</option>
                </select>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add task
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No tasks assigned to you</p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create your first task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'complete'}
                          readOnly
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <h3 className="text-base font-medium text-gray-900">{task.title}</h3>
                        {task.priority && task.priority !== 'normal' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 ml-8">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 ml-8">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(task.due_date)}
                              {task.due_time_start && !task.is_all_day && (
                                <span> {formatTime(task.due_time_start)}</span>
                              )}
                              {task.due_time_end && !task.is_all_day && (
                                <span> - {formatTime(task.due_time_end)}</span>
                              )}
                            </span>
                          </div>
                        )}
                        {task.assigned_to_id && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contacts Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Contacts</h2>
              <Link
                href="/contacts"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {contacts.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No contacts yet</p>
                <Link
                  href="/contacts/new"
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create your first contact
                </Link>
              </div>
            ) : (
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
                                <TaskIcon className="h-4 w-4" />
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
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSuccess={() => {
          setShowTaskModal(false);
          // Refresh dashboard data
          const fetchDashboardData = async () => {
            try {
              const dashboardResponse = await dashboardApi.get();
              setTasks(dashboardResponse.data.tasks || []);
              setContacts(dashboardResponse.data.contacts || []);
              setTaskCount(dashboardResponse.data.task_count || 0);
              setContactCount(dashboardResponse.data.contact_count || 0);
            } catch (error) {
              console.error('Failed to refresh dashboard:', error);
            }
          };
          fetchDashboardData();
        }}
      />
    </div>
  );
}
