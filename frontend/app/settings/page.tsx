'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, CreditCard, Bell, Globe, Folder, Plus, X, Database, Edit2, Trash2, Check, LayoutTemplate, CheckSquare, Users, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authApi, authUtils, documentsApi, contactFieldsApi, taskTypesApi } from '@/lib/api';

interface UserData {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  subscription_tier: string;
}

interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
}

interface ContactFieldDefinition {
  id: number;
  name: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  section: string;
  display_order: number;
  options?: string[];
  placeholder?: string;
  help_text?: string;
  is_active: boolean;
}

interface TaskType {
  id: number;
  name: string;
  description?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  // Task Types State
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [showAddTaskType, setShowAddTaskType] = useState(false);
  const [newTaskTypeName, setNewTaskTypeName] = useState('');
  const [newTaskTypeDescription, setNewTaskTypeDescription] = useState('');
  const [creatingTaskType, setCreatingTaskType] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null);
  
  // Contact Fields State
  const [fields, setFields] = useState<ContactFieldDefinition[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  
  // Field Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldSection, setFieldSection] = useState('custom');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldHelpText, setFieldHelpText] = useState('');
  const [fieldOptions, setFieldOptions] = useState(''); // Comma separated
  const [editingField, setEditingField] = useState<ContactFieldDefinition | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    admin: true,
    team: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => pathname === path;

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
    fetchCategories();
    fetchFields();
    fetchTaskTypes();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await documentsApi.listCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFields = async () => {
    try {
      setLoadingFields(true);
      const response = await contactFieldsApi.list(true); // Include inactive
      setFields(response.data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoadingFields(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await taskTypesApi.list();
      setTaskTypes(response.data);
    } catch (error) {
      console.error('Error fetching task types:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setCreatingCategory(true);
      await documentsApi.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription || undefined,
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowAddCategory(false);
      fetchCategories();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateTaskType = async () => {
    if (!newTaskTypeName.trim()) {
      alert('Task type name is required');
      return;
    }

    try {
      setCreatingTaskType(true);
      await taskTypesApi.create({
        name: newTaskTypeName.trim(),
        description: newTaskTypeDescription || undefined,
      });
      setNewTaskTypeName('');
      setNewTaskTypeDescription('');
      setShowAddTaskType(false);
      setEditingTaskType(null);
      fetchTaskTypes();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to create task type');
    } finally {
      setCreatingTaskType(false);
    }
  };

  const handleUpdateTaskType = async () => {
    if (!editingTaskType || !newTaskTypeName.trim()) {
      alert('Task type name is required');
      return;
    }

    try {
      setCreatingTaskType(true);
      await taskTypesApi.update(editingTaskType.id.toString(), {
        name: newTaskTypeName.trim(),
        description: newTaskTypeDescription || undefined,
      });
      setNewTaskTypeName('');
      setNewTaskTypeDescription('');
      setShowAddTaskType(false);
      setEditingTaskType(null);
      fetchTaskTypes();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to update task type');
    } finally {
      setCreatingTaskType(false);
    }
  };

  const handleDeleteTaskType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task type? This cannot be undone if tasks are using it.')) return;

    try {
      await taskTypesApi.delete(id.toString());
      fetchTaskTypes();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete task type');
    }
  };

  const startEditingTaskType = (taskType: TaskType) => {
    setEditingTaskType(taskType);
    setNewTaskTypeName(taskType.name);
    setNewTaskTypeDescription(taskType.description || '');
    setShowAddTaskType(true);
  };

  const resetFieldForm = () => {
    setFieldName('');
    setFieldKey('');
    setFieldType('text');
    setFieldSection('custom');
    setFieldRequired(false);
    setFieldPlaceholder('');
    setFieldHelpText('');
    setFieldOptions('');
    setEditingField(null);
    setShowAddField(false);
  };

  const handleSaveField = async () => {
    if (!fieldName || !fieldKey) {
      alert('Name and Field Key are required');
      return;
    }

    try {
      const fieldData = {
        name: fieldName,
        field_key: fieldKey.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        field_type: fieldType,
        section: fieldSection,
        is_required: fieldRequired,
        placeholder: fieldPlaceholder || undefined,
        help_text: fieldHelpText || undefined,
        options: (fieldType === 'dropdown' || fieldType === 'multiselect') 
          ? fieldOptions.split(',').map((o) => o.trim()).filter(Boolean) 
          : undefined,
      };

      if (editingField) {
        await contactFieldsApi.update(editingField.id.toString(), fieldData);
      } else {
        await contactFieldsApi.create(fieldData);
      }

      resetFieldForm();
      fetchFields();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to save field');
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm('Are you sure you want to delete this field? This cannot be undone.')) return;

    try {
      await contactFieldsApi.delete(id.toString());
      fetchFields();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete field');
    }
  };

  const handleApplyTemplate = async (templateName: string) => {
    if (!confirm('This will add standard roofing/adjusting fields to your contacts. Existing fields with same keys will be skipped. Continue?')) return;
    
    try {
      setApplyingTemplate(true);
      await contactFieldsApi.applyTemplate(templateName);
      fetchFields();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to apply template');
    } finally {
      setApplyingTemplate(false);
    }
  };

  const startEditing = (field: ContactFieldDefinition) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldKey(field.field_key);
    setFieldType(field.field_type);
    setFieldSection(field.section);
    setFieldRequired(field.is_required);
    setFieldPlaceholder(field.placeholder || '');
    setFieldHelpText(field.help_text || '');
    setFieldOptions(field.options?.join(', ') || '');
    setShowAddField(true);
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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/settings') && pathname !== '/settings/teams' && pathname !== '/settings/company'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  General Settings
                </Link>
                
                {/* Admin Settings Section */}
                <div>
                  <button
                    onClick={() => toggleSection('admin')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4" />
                      Admin Settings
                    </div>
                    {expandedSections.admin ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.admin && (
                    <div className="ml-7 mt-1 space-y-1">
                      <Link
                        href="/settings/company"
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive('/settings/company')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                        Company
                      </Link>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                        <CreditCard className="h-4 w-4" />
                        Subscription
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Team Section */}
                <div>
                  <button
                    onClick={() => toggleSection('team')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      Team
                    </div>
                    {expandedSections.team ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.team && (
                    <div className="ml-7 mt-1 space-y-1">
                      <Link
                        href="/settings/teams"
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive('/settings/teams')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        Team
                      </Link>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        Access Profiles
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                  <Database className="h-4 w-4" />
                  Contact Fields
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.full_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your username"
                      readOnly
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={user.email}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Plan</p>
                    <p className="text-sm text-gray-600 capitalize">{user.subscription_tier}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Manage Subscription
                  </button>
                </div>
              </div>

              {/* Document Categories Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Folder className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Document Categories</h2>
                  </div>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>

                {showAddCategory && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Create New Category</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Estimate, Contract, Invoice"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter description..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateCategory}
                          disabled={creatingCategory || !newCategoryName.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingCategory ? 'Creating...' : 'Create Category'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategoryName('');
                            setNewCategoryDescription('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No categories created yet</p>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Contact Fields Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Database className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Contact Fields</h2>
                      <p className="text-sm text-gray-500">Customize fields for your contacts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyTemplate('roofing_adjusting')}
                      disabled={applyingTemplate}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <LayoutTemplate className="h-4 w-4" />
                      {applyingTemplate ? 'Applying...' : 'Apply Roofing Template'}
                    </button>
                    <button
                      onClick={() => {
                        resetFieldForm();
                        setShowAddField(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </button>
                  </div>
                </div>

                {showAddField && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      {editingField ? 'Edit Field' : 'Create New Field'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Name *
                        </label>
                        <input
                          type="text"
                          value={fieldName}
                          onChange={(e) => {
                            setFieldName(e.target.value);
                            if (!editingField && !fieldKey) {
                              setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Roof Type"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Key * (Unique)
                        </label>
                        <input
                          type="text"
                          value={fieldKey}
                          onChange={(e) => setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                          disabled={!!editingField} // Cannot change key after creation
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          placeholder="e.g., roof_type"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Type
                        </label>
                        <select
                          value={fieldType}
                          onChange={(e) => setFieldType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="datetime">Date & Time</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="multiselect">Checkbox Group (Multiple Selection)</option>
                          <option value="boolean">Checkbox (Yes/No)</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="textarea">Text Area</option>
                          <option value="url">URL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <select
                          value={fieldSection}
                          onChange={(e) => setFieldSection(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="basic">Basic Information</option>
                          <option value="contact_details">Contact Details</option>
                          <option value="custom">Custom Fields</option>
                          <option value="industry_specific">Industry Specific</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={fieldPlaceholder}
                          onChange={(e) => setFieldPlaceholder(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Help Text
                        </label>
                        <input
                          type="text"
                          value={fieldHelpText}
                          onChange={(e) => setFieldHelpText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {(fieldType === 'dropdown' || fieldType === 'multiselect') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (comma separated)
                        </label>
                        <input
                          type="text"
                          value={fieldOptions}
                          onChange={(e) => setFieldOptions(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fieldRequired}
                          onChange={(e) => setFieldRequired(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Required Field</span>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveField}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {editingField ? 'Update Field' : 'Create Field'}
                      </button>
                      <button
                        onClick={resetFieldForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {fields.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No custom fields defined</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fields.map((field) => (
                            <tr key={field.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{field.name}</div>
                                <div className="text-xs text-gray-500">{field.field_key}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                  {field.field_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {field.section.replace('_', ' ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => startEditing(field)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteField(field.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Types Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Task Types</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddTaskType(true);
                      setEditingTaskType(null);
                      setNewTaskTypeName('');
                      setNewTaskTypeDescription('');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task Type
                  </button>
                </div>

                {showAddTaskType && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      {editingTaskType ? 'Edit Task Type' : 'Create New Task Type'}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Type Name *
                        </label>
                        <input
                          type="text"
                          value={newTaskTypeName}
                          onChange={(e) => setNewTaskTypeName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Follow-up, Inspection, Estimate"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newTaskTypeDescription}
                          onChange={(e) => setNewTaskTypeDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter description..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={editingTaskType ? handleUpdateTaskType : handleCreateTaskType}
                          disabled={creatingTaskType || !newTaskTypeName.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingTaskType ? 'Saving...' : editingTaskType ? 'Update Task Type' : 'Create Task Type'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddTaskType(false);
                            setEditingTaskType(null);
                            setNewTaskTypeName('');
                            setNewTaskTypeDescription('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {taskTypes.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No task types created yet</p>
                  ) : (
                    taskTypes.map((taskType) => (
                      <div
                        key={taskType.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{taskType.name}</p>
                          {taskType.description && (
                            <p className="text-xs text-gray-600 mt-1">{taskType.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditingTaskType(taskType)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTaskType(taskType.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
