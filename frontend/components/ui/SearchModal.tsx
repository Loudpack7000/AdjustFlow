'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, User, FolderKanban, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { contactsApi, projectsApi, tasksApi } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{
    contacts: any[];
    projects: any[];
    tasks: any[];
  }>({ contacts: [], projects: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This will be handled by the parent component
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setResults({ contacts: [], projects: [], tasks: [] });
        return;
      }

      setLoading(true);
      try {
        const [contactsRes, projectsRes, tasksRes] = await Promise.all([
          contactsApi.list(searchQuery).catch(() => ({ data: [] })),
          projectsApi.list().catch(() => ({ data: [] })),
          tasksApi.list().catch(() => ({ data: [] }))
        ]);

        // Filter projects and tasks client-side
        const filteredProjects = (projectsRes.data || []).filter((p: any) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const filteredTasks = (tasksRes.data || []).filter((t: any) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setResults({
          contacts: contactsRes.data || [],
          projects: filteredProjects,
          tasks: filteredTasks
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleContactClick = (contactId: number) => {
    router.push(`/contacts/${contactId}`);
    onClose();
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
    onClose();
  };

  const handleTaskClick = (taskId: number) => {
    router.push(`/dashboard`);
    onClose();
  };

  if (!isOpen) return null;

  const totalResults = results.contacts.length + results.projects.length + results.tasks.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for jobs, contacts, tasks, and more across your workspace"
            className="flex-1 outline-none text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">Start typing to search</p>
              <p className="text-sm text-gray-500 text-center">
                Search for jobs, contacts, tasks, and more across your workspace
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.contacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacts ({results.contacts.length})
                  </h3>
                  <div className="space-y-2">
                    {results.contacts.slice(0, 5).map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleContactClick(contact.id)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="font-medium text-gray-900">{contact.full_name}</div>
                        {contact.email && (
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        )}
                        {contact.company && (
                          <div className="text-sm text-gray-500">{contact.company}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projects ({results.projects.length})
                  </h3>
                  <div className="space-y-2">
                    {results.projects.slice(0, 5).map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks ({results.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {results.tasks.slice(0, 5).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500">{task.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

