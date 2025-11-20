'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Mail, Phone, Search, Filter } from 'lucide-react';
import { activitiesApi } from '@/lib/api';

interface Activity {
  id: number;
  activity_type: string;
  content: string;
  subject?: string;
  created_by_id: number;
  created_by_name?: string;
  created_at: string;
  related_contact_ids?: number[];
}

interface ContactActivityTabProps {
  contactId: string;
}

export default function ContactActivityTab({ contactId }: ContactActivityTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [contactId, activityFilter, searchQuery]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activityFilter !== 'all') {
        params.activity_type = activityFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await activitiesApi.listByContact(contactId, params);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      await activitiesApi.create(contactId, {
        activity_type: 'note',
        content: noteContent,
        related_contact_ids: []
      });
      setNoteContent('');
      setShowAddNoteModal(false);
      fetchActivities();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'text':
        return 'Text Message';
      case 'phone_call':
        return 'Phone Call';
      default:
        return 'Note';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Activity Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Activities</option>
              <option value="note">Notes</option>
              <option value="email">Emails</option>
              <option value="text">Text Messages</option>
              <option value="phone_call">Phone Calls</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes, emails, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTextModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Send text message
              </button>
              <button
                onClick={() => setShowAddEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Send email
              </button>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">No activities found</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-gray-400">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getActivityTypeLabel(activity.activity_type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(activity.created_at)}
                    </span>
                    {activity.created_by_name && (
                      <span className="text-sm text-gray-500">
                        by {activity.created_by_name}
                      </span>
                    )}
                  </div>
                  {activity.subject && (
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {activity.subject}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {activity.content}
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

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Note</h3>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNoteContent('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Email Modal - Placeholder */}
      {showAddEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">Email functionality coming soon...</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAddEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Text Modal - Placeholder */}
      {showAddTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Text Message</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">Text messaging functionality coming soon...</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAddTextModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

