'use client';

import { useState, useEffect } from 'react';
import { X, Save, Search, Calendar, Clock } from 'lucide-react';
import { tasksApi, contactsApi, authApi, taskTypesApi, teamsApi } from '@/lib/api';

interface Contact {
  id: number;
  full_name: string;
  email?: string;
  company?: string;
}


interface TaskType {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContactId?: number;
  mode?: 'create' | 'edit';
  taskId?: number;
  initialData?: {
    taskTypeId?: number;
    title?: string;
    description?: string;
    isAllDay?: boolean;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    priority?: string;
    assignedToId?: number;
    contactIds?: number[];
  };
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, defaultContactId, mode = 'create', taskId, initialData }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  
  // Form state
  const [taskTypeId, setTaskTypeId] = useState<number | undefined>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState('normal');
  const [assignedToId, setAssignedToId] = useState<number | undefined>();
  const [assignedToSearch, setAssignedToSearch] = useState('');
  const [subcontractorIds, setSubcontractorIds] = useState<number[]>([]);
  const [subcontractorSearch, setSubcontractorSearch] = useState('');
  const [contactIds, setContactIds] = useState<number[]>(defaultContactId ? [defaultContactId] : []);
  const [contactSearch, setContactSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Show dropdowns
  const [showAssignedToDropdown, setShowAssignedToDropdown] = useState(false);
  const [showSubcontractorDropdown, setShowSubcontractorDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && taskId) {
        fetchTask();
      } else {
        resetForm();
      }
      fetchCurrentUser();
      fetchContacts();
      fetchTaskTypes();
      fetchUsers();
    }
  }, [isOpen, mode, taskId]);

  // Set default assigned user after both currentUser and users are loaded
  useEffect(() => {
    if (currentUserId && users.length > 0 && !assignedToSearch && isOpen) {
      const currentUser = users.find(u => u.id === currentUserId);
      if (currentUser) {
        setAssignedToId(currentUserId);
        setAssignedToSearch(currentUser.full_name || currentUser.username);
      }
    }
  }, [currentUserId, users, isOpen, assignedToSearch]);

  useEffect(() => {
    if (assignedToSearch) {
      const filtered = users.filter(user => 
        (user.full_name || user.username || '').toLowerCase().includes(assignedToSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(assignedToSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowAssignedToDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowAssignedToDropdown(false);
    }
  }, [assignedToSearch, users]);

  useEffect(() => {
    if (subcontractorSearch) {
      const filtered = contacts.filter(contact => 
        contact.full_name.toLowerCase().includes(subcontractorSearch.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(subcontractorSearch.toLowerCase()) ||
        (contact.company || '').toLowerCase().includes(subcontractorSearch.toLowerCase())
      );
      setFilteredContacts(filtered.filter(c => !subcontractorIds.includes(c.id)));
      setShowSubcontractorDropdown(true);
    } else {
      setFilteredContacts([]);
      setShowSubcontractorDropdown(false);
    }
  }, [subcontractorSearch, contacts, subcontractorIds]);

  useEffect(() => {
    if (contactSearch) {
      const filtered = contacts.filter(contact => 
        contact.full_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
        (contact.company || '').toLowerCase().includes(contactSearch.toLowerCase())
      );
      setFilteredContacts(filtered.filter(c => !contactIds.includes(c.id)));
      setShowContactDropdown(true);
    } else {
      setFilteredContacts([]);
      setShowContactDropdown(false);
    }
  }, [contactSearch, contacts, contactIds]);

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await tasksApi.get(taskId.toString());
      const task = response.data;
      // Populate form with task data
      setTaskTypeId(task.task_type_id);
      setTitle(task.title);
      setDescription(task.description || '');
      setIsAllDay(task.is_all_day || false);
      if (task.due_date) {
        const date = new Date(task.due_date);
        setStartDate(date.toISOString().split('T')[0]);
        setEndDate(date.toISOString().split('T')[0]);
      }
      if (task.due_time_start) {
        const time = new Date(task.due_time_start);
        setStartTime(time.toTimeString().slice(0, 5));
      }
      if (task.due_time_end) {
        const time = new Date(task.due_time_end);
        setEndTime(time.toTimeString().slice(0, 5));
      }
      setPriority(task.priority || 'normal');
      setAssignedToId(task.assigned_to_id);
      if (task.assigned_to_id && users.length > 0) {
        const assignedUser = users.find(u => u.id === task.assigned_to_id);
        if (assignedUser) {
          setAssignedToSearch(assignedUser.full_name || assignedUser.username);
        }
      }
      setContactIds(task.contact_ids || []);
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (initialData) {
      // Use initial data if provided
      setTaskTypeId(initialData.taskTypeId);
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setIsAllDay(initialData.isAllDay || false);
      setStartDate(initialData.startDate || '');
      setStartTime(initialData.startTime || '');
      setEndDate(initialData.endDate || '');
      setEndTime(initialData.endTime || '');
      setPriority(initialData.priority || 'normal');
      setAssignedToId(initialData.assignedToId);
      setContactIds(initialData.contactIds || []);
    } else {
      // Reset to defaults
      setTaskTypeId(undefined);
      setTitle('');
      setDescription('');
      setIsAllDay(false);
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setPriority('normal');
      setAssignedToId(undefined);
      setAssignedToSearch('');
      setSubcontractorIds([]);
      setSubcontractorSearch('');
      setContactIds(defaultContactId ? [defaultContactId] : []);
      setContactSearch('');
      setTags([]);
      setTagInput('');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.me();
      const userId = response.data.id;
      setCurrentUserId(userId);
      // Default to assigning to current user
      setAssignedToId(userId);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsApi.list();
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
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

  const fetchUsers = async () => {
    try {
      const response = await teamsApi.listUsers({ is_active: true });
      setUsers(response.data);
      // Set default assigned to search if currentUserId is set
      if (currentUserId) {
        const currentUser = response.data.find((u: User) => u.id === currentUserId);
        if (currentUser && !assignedToSearch) {
          setAssignedToSearch(currentUser.full_name || currentUser.username);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSelectUser = (user: User) => {
    setAssignedToId(user.id);
    setAssignedToSearch(user.full_name || user.username);
    setShowAssignedToDropdown(false);
  };

  const handleAddSubcontractor = (contactId: number) => {
    if (!subcontractorIds.includes(contactId)) {
      setSubcontractorIds([...subcontractorIds, contactId]);
      setSubcontractorSearch('');
      setShowSubcontractorDropdown(false);
    }
  };

  const handleRemoveSubcontractor = (contactId: number) => {
    setSubcontractorIds(subcontractorIds.filter(id => id !== contactId));
  };

  const handleAddContact = (contactId: number) => {
    if (!contactIds.includes(contactId)) {
      setContactIds([...contactIds, contactId]);
      setContactSearch('');
      setShowContactDropdown(false);
    }
  };

  const handleRemoveContact = (contactId: number) => {
    setContactIds(contactIds.filter(id => id !== contactId));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim()) {
      setError('Task Name is required');
      setLoading(false);
      return;
    }

    try {
      // Use startDate for due_date, and endDate for end date if provided
      const dueDate = startDate || undefined;
      const dueTimeStart = startDate && startTime && !isAllDay ? `${startDate}T${startTime}` : undefined;
      const dueTimeEnd = endDate && endTime && !isAllDay ? `${endDate}T${endTime}` : undefined;

      const taskData: any = {
        title: title.trim(),
        description: description || undefined,
        priority: priority === 'normal' ? undefined : priority,
        task_type_id: taskTypeId || undefined,
        due_date: dueDate,
        due_time_start: dueTimeStart,
        due_time_end: dueTimeEnd,
        is_all_day: isAllDay,
        assigned_to_id: assignedToId || undefined,
        contact_ids: contactIds,
        // Note: subcontractor_ids and tags would need backend support
        // For now, we'll just send what the API supports
      };

      // Only set status when creating, not when editing
      if (mode !== 'edit') {
        taskData.status = 'incomplete';
      }

      if (mode === 'edit' && taskId) {
        await tasksApi.update(taskId.toString(), taskData);
      } else {
        await tasksApi.create(taskData);
      }
      
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to ${mode === 'edit' ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find(u => u.id === assignedToId);
  const selectedSubcontractors = contacts.filter(c => subcontractorIds.includes(c.id));
  const selectedContacts = contacts.filter(c => contactIds.includes(c.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Create Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                value={taskTypeId || ''}
                onChange={(e) => setTaskTypeId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Task</option>
                {taskTypes.map((taskType) => (
                  <option key={taskType.id} value={taskType.id}>
                    {taskType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </div>

            {/* All day checkbox */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">All day</span>
              </label>
            </div>

            {/* Start/Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start/Due Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!isAllDay && (
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!isAllDay && (
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">None</option>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assigned To */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assignedToSearch}
                  onChange={(e) => {
                    setAssignedToSearch(e.target.value);
                    if (!e.target.value) {
                      setAssignedToId(undefined);
                    }
                  }}
                  onFocus={() => {
                    if (assignedToSearch) {
                      setShowAssignedToDropdown(true);
                    }
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for a team member"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {selectedUser && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignedToId(undefined);
                        setAssignedToSearch('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {showAssignedToDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{user.full_name || user.username}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subcontractors */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcontractors
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subcontractorSearch}
                  onChange={(e) => setSubcontractorSearch(e.target.value)}
                  onFocus={() => {
                    if (subcontractorSearch) {
                      setShowSubcontractorDropdown(true);
                    }
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select subcontractors..."
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {showSubcontractorDropdown && filteredContacts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleAddSubcontractor(contact.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50"
                      >
                        {contact.full_name}
                        {contact.company && <span className="text-sm text-gray-500 ml-2">({contact.company})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedSubcontractors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSubcontractors.map((contact) => (
                    <span
                      key={contact.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                    >
                      {contact.full_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcontractor(contact.id)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Related Contacts */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Contacts
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  onFocus={() => {
                    if (contactSearch) {
                      setShowContactDropdown(true);
                    }
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter or search for a contact"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {showContactDropdown && filteredContacts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleAddContact(contact.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50"
                      >
                        {contact.full_name}
                        {contact.email && <span className="text-sm text-gray-500 ml-2">({contact.email})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedContacts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedContacts.map((contact) => (
                    <span
                      key={contact.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                    >
                      {contact.full_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(contact.id)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select tags..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-gray-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
