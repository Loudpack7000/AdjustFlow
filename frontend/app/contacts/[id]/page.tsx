'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Calendar, Tag, Users, CheckCircle, XCircle } from 'lucide-react';
import { contactsApi, contactFieldsApi } from '@/lib/api';
import ContactActivityTab from '@/components/contacts/ContactActivityTab';
import ContactTasksTab from '@/components/contacts/ContactTasksTab';
import ContactDocumentsTab from '@/components/contacts/ContactDocumentsTab';
import ContactPhotosTab from '@/components/contacts/ContactPhotosTab';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  email?: string;
  main_phone?: string;
  mobile_phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  company?: string;
  contact_type?: string;
  status?: string;
  sales_rep_id?: number;
  lead_source?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  customer_type?: string;
  texting_opt_out: boolean;
  date_of_loss?: string;
  roof_type?: string;
  insurance_carrier?: string;
  policy_number?: string;
  claim_number?: string;
  deductible?: number;
  desk_adjuster_name?: string;
  desk_adjuster_phone?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  full_name: string;
}

interface ContactFieldDefinition {
  id: number;
  name: string;
  field_key: string;
  field_type: string;
  section: string;
  display_order: number;
}

type TabType = 'activity' | 'tasks' | 'documents' | 'photos';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [fieldDefinitions, setFieldDefinitions] = useState<ContactFieldDefinition[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactResponse, fieldsResponse] = await Promise.all([
          contactsApi.get(contactId),
          contactFieldsApi.list()
        ]);
        setContact(contactResponse.data);
        setFieldDefinitions(fieldsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchData();
    }
  }, [contactId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact not found</h1>
          <button
            onClick={() => router.push('/contacts')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to contacts
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = () => {
    const parts = [
      contact.address_line_1,
      contact.address_line_2,
      contact.city,
      contact.state,
      contact.postal_code
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const formatCustomFieldValue = (field: ContactFieldDefinition, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    switch (field.field_type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toString() : value;
      case 'multiselect':
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : 'N/A';
        }
        return String(value);
      default:
        return String(value);
    }
  };

  const getFieldsBySection = (section: string) => {
    return fieldDefinitions
      .filter(field => field.section === section && field.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const renderCustomFieldsSection = (section: string, title: string) => {
    const fields = getFieldsBySection(section);
    const hasValues = fields.some(field => {
      const value = contact.custom_fields?.[field.field_key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasValues) return null;

    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {fields.map((field) => {
            const value = contact.custom_fields?.[field.field_key];
            if (value === null || value === undefined || value === '') {
              return null;
            }
            if (Array.isArray(value) && value.length === 0) {
              return null;
            }
            return (
              <div key={field.id}>
                <span className="font-medium">{field.name}:</span>{' '}
                {formatCustomFieldValue(field, value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/contacts')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Go to contacts</span>
          </button>
        </div>
      </div>

      {/* Contact Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Contact Information */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contact.full_name}</h1>
                  {contact.company && (
                    <p className="text-gray-600">{contact.company}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {contact.main_phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{contact.main_phone}</span>
                  </div>
                )}
                {contact.mobile_phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{contact.mobile_phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-gray-400">E:</span>
                    <span>{contact.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span>{formatAddress()}</span>
                </div>
              </div>

              {/* Project/Claim Specifics */}
              {(contact.date_of_loss || contact.roof_type || contact.insurance_carrier || contact.policy_number || contact.claim_number) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Project/Claim Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {contact.date_of_loss && (
                      <div><span className="font-medium">Date of Loss:</span> {formatDate(contact.date_of_loss)}</div>
                    )}
                    {contact.roof_type && (
                      <div><span className="font-medium">Roof Type:</span> {contact.roof_type}</div>
                    )}
                    {contact.insurance_carrier && (
                      <div><span className="font-medium">Insurance Carrier:</span> {contact.insurance_carrier}</div>
                    )}
                    {contact.policy_number && (
                      <div><span className="font-medium">Policy #:</span> {contact.policy_number}</div>
                    )}
                    {contact.claim_number && (
                      <div><span className="font-medium">Claim #:</span> {contact.claim_number}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Fields - Basic Section */}
              {renderCustomFieldsSection('basic', 'Additional Information')}

              {/* Custom Fields - Custom Section */}
              {renderCustomFieldsSection('custom', 'Custom Fields')}

              {/* Custom Fields - Industry Specific Section */}
              {renderCustomFieldsSection('industry_specific', 'Industry Specific Details')}
            </div>

            {/* Right Column - Workflow Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Workflow Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">{contact.contact_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">{contact.status || 'N/A'}</span>
                </div>
                {contact.lead_source && (
                  <div>
                    <span className="text-sm text-gray-600">Lead Source:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">{contact.lead_source}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Texting Opt Out:</span>
                  <span className={`ml-2 text-sm font-medium ${contact.texting_opt_out ? 'text-red-600' : 'text-green-600'}`}>
                    {contact.texting_opt_out ? (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Opted Out
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Opted In
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Created By:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">User</span>
                  <span className="ml-2 text-sm text-gray-600">on {formatDate(contact.created_at)}</span>
                </div>
              </div>

              {/* Custom Fields - Contact Details Section */}
              {renderCustomFieldsSection('contact_details', 'Additional Contact Details')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {(['activity', 'tasks', 'documents', 'photos'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'activity' && <ContactActivityTab contactId={contactId} />}
        {activeTab === 'tasks' && <ContactTasksTab contactId={contactId} />}
        {activeTab === 'documents' && <ContactDocumentsTab contactId={contactId} />}
        {activeTab === 'photos' && <ContactPhotosTab contactId={contactId} />}
      </div>
    </div>
  );
}

