'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Calendar, Clock, User, CheckSquare, Tag, FileText, Paperclip } from 'lucide-react';
import { tasksApi, contactsApi, authApi } from '@/lib/api';
import EditTaskModal from './EditTaskModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: number | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
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
  contact_ids?: number[];
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  related_contacts?: Array<{
    id: number;
    full_name: string;
    email?: string;
  }>;
}

interface Contact {
  id: number;
  full_name: string;
  email?: string;
}


interface User {
  id: number;
  full_name?: string;
  username: string;
}

export default function TaskDetailModal({ 
  isOpen, 
  taskId, 
  onClose, 
  onEdit, 
  onDelete, 
  onComplete 
}: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const [taskResponse, usersResponse] = await Promise.all([
        tasksApi.get(taskId.toString()),
        authApi.listUsers()
      ]);

      const taskData = taskResponse.data;
      setTask(taskData);

      // Get assigned user
      if (taskData.assigned_to_id) {
        const user = usersResponse.data.find((u: User) => u.id === taskData.assigned_to_id);
        setAssignedUser(user || null);
      }


      // Get project if exists
      if (taskData.project_id) {
        try {
          const projectResponse = await projectsApi.get(taskData.project_id.toString());
          setProject(projectResponse.data);
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    return status === 'complete' 
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!isOpen || !taskId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading task details...</p>
            </div>
          ) : task ? (
            <div className="px-6 py-4 space-y-6">
              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(task.status)}`}>
                      {task.status === 'complete' ? 'Complete' : 'Incomplete'}
                    </span>
                    {task.priority && task.priority !== 'normal' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                {task.description && (
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">{task.description}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Date/Time */}
                {task.due_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Due Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(task.due_date)}
                        {task.due_time_start && !task.is_all_day && (
                          <span className="ml-2">
                            {formatTime(task.due_time_start)}
                            {task.due_time_end && ` - ${formatTime(task.due_time_end)}`}
                          </span>
                        )}
                        {task.is_all_day && <span className="ml-2 text-gray-500">(All Day)</span>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Assigned To */}
                {assignedUser && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned To</p>
                      <p className="text-sm text-gray-600">
                        {assignedUser.full_name || assignedUser.username}
                      </p>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(task.created_at)}</p>
                  </div>
                </div>

                {/* Completed Date */}
                {task.completed_at && (
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed</p>
                      <p className="text-sm text-gray-600">{formatDate(task.completed_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Contacts */}
              {task.related_contacts && task.related_contacts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Related Contacts</p>
                  <div className="flex flex-wrap gap-2">
                    {task.related_contacts.map((contact) => (
                      <span
                        key={contact.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                      >
                        <User className="h-4 w-4" />
                        {contact.full_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
                {task.status !== 'complete' && (
                  <button
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                      onDelete();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>Task not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && taskId && (
        <EditTaskModal
          isOpen={showEditModal}
          taskId={taskId}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchTaskDetails();
            onEdit();
          }}
        />
      )}
    </>
  );
}

