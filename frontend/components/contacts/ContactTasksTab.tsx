'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { tasksApi, contactsApi } from '@/lib/api';

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

interface ContactTasksTabProps {
  contactId: string;
}

export default function ContactTasksTab({ contactId }: ContactTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [contactId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Get contact first to verify it exists
      await contactsApi.get(contactId);
      // Get all tasks and filter by contact relationship (this would need backend support)
      // For now, we'll get all tasks - in production, we'd filter by contact_id
      const response = await tasksApi.list();
      // Filter tasks that have this contact in related_contacts
      // Note: This is a simplified version - in production, the backend should filter
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
        return 'text-red-600 bg-red-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No tasks found for this contact</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckSquare className={`h-5 w-5 ${task.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`} />
                    <h3 className="text-base font-medium text-gray-900">{task.title}</h3>
                    {task.priority && task.priority !== 'normal' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
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
  );
}

