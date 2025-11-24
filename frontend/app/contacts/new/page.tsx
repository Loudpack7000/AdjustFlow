'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save } from 'lucide-react';
import { contactsApi, contactFieldsApi, teamsApi } from '@/lib/api';

interface User {
  id: number;
  username: string;
  full_name?: string;
}

interface ContactFieldDefinition {
  id: number;
  name: string;
  field_key: string;
  field_type: string; // text, number, date, datetime, dropdown, multiselect, boolean, email, phone, textarea, url
  is_required: boolean;
  section: string; // basic, contact_details, custom, industry_specific
  display_order: number;
  options?: string[]; // For dropdown fields
  placeholder?: string;
  help_text?: string;
  is_active: boolean;
}

export default function CreateContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [salesReps, setSalesReps] = useState<User[]>([]);
  const [fieldDefinitions, setFieldDefinitions] = useState<ContactFieldDefinition[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  
  // Form state - Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  
  // Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Contact Details
  const [contactType, setContactType] = useState('');
  const [status, setStatus] = useState('');
  const [salesRepId, setSalesRepId] = useState<number | undefined>();
  const [leadSource, setLeadSource] = useState('');
  const [assignedToIds, setAssignedToIds] = useState<number[]>([]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [textingOptOut, setTextingOptOut] = useState(false);
  
  // Custom fields state - stored by field_key
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // Load field definitions, users, and sales reps
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load field definitions
        const fieldsResponse = await contactFieldsApi.list();
        setFieldDefinitions(fieldsResponse.data || []);
        
        // Load sales reps
        try {
          const salesRepsResponse = await teamsApi.listSalesReps();
          setSalesReps(salesRepsResponse.data || []);
        } catch (error) {
          console.error('Error loading sales reps:', error);
        }
        
        // For now, just set empty array for users
        setUsers([]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingFields(false);
      }
    };
    loadData();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCustomFieldChange = (fieldKey: string, value: any) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldKey]: value === '' ? undefined : value
    }));
  };

  const handleMultiselectChange = (fieldKey: string, option: string, checked: boolean) => {
    setCustomFields(prev => {
      const currentValue = prev[fieldKey] || [];
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      
      let newArray;
      if (checked) {
        newArray = [...currentArray, option];
      } else {
        newArray = currentArray.filter((item: string) => item !== option);
      }
      
      return {
        ...prev,
        [fieldKey]: newArray.length > 0 ? newArray : undefined
      };
    });
  };

  const renderField = (field: ContactFieldDefinition) => {
    const value = customFields[field.field_key] || '';
    const commonProps = {
      id: `field-${field.field_key}`,
      required: field.is_required,
      placeholder: field.placeholder,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
    };

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            {...commonProps}
            type={field.field_type === 'email' ? 'email' : field.field_type === 'url' ? 'url' : field.field_type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            step="any"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        );
      
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          />
        );
      
      case 'datetime':
        return (
          <input
            {...commonProps}
            type="datetime-local"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          />
        );
      
      case 'dropdown':
        return (
          <select
            {...commonProps}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleCustomFieldChange(field.field_key, e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{field.help_text || 'Yes'}</span>
          </label>
        );
      
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => handleMultiselectChange(field.field_key, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_key, e.target.value)}
          />
        );
    }
  };

  const getFieldsBySection = (section: string) => {
    return fieldDefinitions
      .filter(field => field.section === section && field.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!firstName || !lastName || !displayName) {
      setError('First Name, Last Name, and Display Name are required');
      setLoading(false);
      return;
    }

    // Validate required custom fields
    const requiredFields = fieldDefinitions.filter(f => f.is_required && f.is_active);
    for (const field of requiredFields) {
      if (!customFields[field.field_key] || customFields[field.field_key] === '') {
        setError(`${field.name} is required`);
        setLoading(false);
        return;
      }
    }

    try {
      // Build custom_fields object, only including fields that have values
      const customFieldsData: Record<string, any> = {};
      Object.keys(customFields).forEach(key => {
        if (customFields[key] !== undefined && customFields[key] !== '') {
          customFieldsData[key] = customFields[key];
        }
      });

      const contactData: any = {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        company: company || undefined,
        email: email || undefined,
        website: website || undefined,
        main_phone: mainPhone || undefined,
        mobile_phone: mobilePhone || undefined,
        address_line_1: addressLine1 || undefined,
        address_line_2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        contact_type: contactType || undefined,
        status: status || undefined,
        sales_rep_id: salesRepId || undefined,
        lead_source: leadSource || undefined,
        assigned_to_ids: assignedToIds,
        description: description || undefined,
        notes: notes || undefined,
        tags: tags,
        customer_type: customerType || undefined,
        texting_opt_out: textingOptOut,
        custom_fields: Object.keys(customFieldsData).length > 0 ? customFieldsData : undefined,
      };

      const response = await contactsApi.create(contactData);
      router.push(`/contacts/${response.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingFields) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading form...</div>
      </div>
    );
  }

  const customFieldsSections = ['basic', 'contact_details', 'custom', 'industry_specific'];
  const sectionTitles: Record<string, string> = {
    basic: 'Basic Information',
    contact_details: 'Contact Details',
    custom: 'Custom Fields',
    industry_specific: 'Industry Specific',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create Contact</h1>
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Standard Basic Fields */}
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Phone
                </label>
                <input
                  type="tel"
                  value={mainPhone}
                  onChange={(e) => setMainPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={textingOptOut}
                    onChange={(e) => setTextingOptOut(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Texting Opt-Out</span>
                </label>
              </div>

              {/* Dynamic Custom Fields - Basic Section */}
              {getFieldsBySection('basic').map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name} {field.is_required && '*'}
                  </label>
                  {renderField(field)}
                  {field.help_text && (
                    <p className="mt-1 text-xs text-gray-500">{field.help_text}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Standard Contact Details */}
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Type
                </label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Customer">Customer</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Pre-Inspection">Pre-Inspection</option>
                  <option value="Active">Active</option>
                  <option value="Future Client">Future Client</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose Source</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Rep
                </label>
                <select
                  value={salesRepId || ''}
                  onChange={(e) => setSalesRepId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.full_name || rep.username} ({rep.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Custom Fields - Contact Details Section */}
              {getFieldsBySection('contact_details').map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name} {field.is_required && '*'}
                  </label>
                  {renderField(field)}
                  {field.help_text && (
                    <p className="mt-1 text-xs text-gray-500">{field.help_text}</p>
                  )}
                </div>
              ))}

              {/* Dynamic Custom Fields - Custom Section */}
              {getFieldsBySection('custom').length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-8">Custom Fields</h2>
                  {getFieldsBySection('custom').map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.name} {field.is_required && '*'}
                      </label>
                      {renderField(field)}
                      {field.help_text && (
                        <p className="mt-1 text-xs text-gray-500">{field.help_text}</p>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Dynamic Custom Fields - Industry Specific Section */}
              {getFieldsBySection('industry_specific').length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-8">Industry Specific</h2>
                  {getFieldsBySection('industry_specific').map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.name} {field.is_required && '*'}
                      </label>
                      {renderField(field)}
                      {field.help_text && (
                        <p className="mt-1 text-xs text-gray-500">{field.help_text}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
