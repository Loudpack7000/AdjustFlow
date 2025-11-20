'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Download, FileText, X, Plus, File, Image as ImageIcon, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { documentsApi } from '@/lib/api';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';

interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_size?: number;
  file_type?: string;
  mime_type?: string;
  pages?: number;
  category_id?: number;
  category_name?: string;
  description?: string;
  is_private?: boolean;
  created_at: string;
  created_by_name?: string;
}

interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
}

interface ContactDocumentsTabProps {
  contactId: string;
}

export default function ContactDocumentsTab({ contactId }: ContactDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: number]: string }>({});
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [contactId, categoryFilter]);

  useEffect(() => {
    // Load thumbnails for both images AND PDFs
    documents.forEach(doc => {
      const isImage = doc.mime_type?.startsWith('image/');
      const isPdf = doc.mime_type === 'application/pdf' || doc.original_filename.toLowerCase().endsWith('.pdf');
      
      if ((isImage || isPdf) && !thumbnailUrls[doc.id]) {
        // Use the dedicated thumbnail endpoint (true for thumbnail param)
        documentsApi.getDocumentBlob(doc.id, false, true)
          .then(blob => {
            if (blob && blob.size > 0) {
              const url = URL.createObjectURL(blob);
              setThumbnailUrls(prev => ({ ...prev, [doc.id]: url }));
            }
          })
          .catch(err => {
            console.error(`Failed to load thumbnail for document ${doc.id}:`, err);
            // Don't set thumbnail on error, will fall back to icon
          });
      }
    });

    // Cleanup URLs when component unmounts
    return () => {
      Object.values(thumbnailUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const categoryId = categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined;
      const response = await documentsApi.listByContact(contactId, categoryId);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await documentsApi.listCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await documentsApi.upload(
        contactId,
        selectedFile,
        selectedCategory,
        description || undefined,
        isPrivate
      );
      
      // Reset form
      setSelectedFile(null);
      setSelectedCategory(undefined);
      setDescription('');
      setIsPrivate(false);
      setShowUploadModal(false);
      
      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert(error?.response?.data?.detail || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDocumentClick = (doc: Document) => {
    setPreviewDocument(doc);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewDocument(null);
  };

  const handleNextDocument = () => {
    if (!previewDocument) return;
    const currentIndex = filteredDocuments.findIndex(d => d.id === previewDocument.id);
    if (currentIndex < filteredDocuments.length - 1) {
      setPreviewDocument(filteredDocuments[currentIndex + 1]);
    }
  };

  const handlePreviousDocument = () => {
    if (!previewDocument) return;
    const currentIndex = filteredDocuments.findIndex(d => d.id === previewDocument.id);
    if (currentIndex > 0) {
      setPreviewDocument(filteredDocuments[currentIndex - 1]);
    }
  };

  const getDocumentThumbnail = (doc: Document) => {
    const isImage = doc.mime_type?.startsWith('image/');
    const isPdf = doc.mime_type === 'application/pdf' || doc.original_filename.toLowerCase().endsWith('.pdf');
    
    // Return thumbnail for images AND PDFs if loaded
    if ((isImage || isPdf) && thumbnailUrls[doc.id]) {
      return thumbnailUrls[doc.id];
    }
    return null;
  };

  const getFileIcon = (doc: Document) => {
    const isPdf = doc.mime_type === 'application/pdf' || doc.original_filename.toLowerCase().endsWith('.pdf');
    const isImage = doc.mime_type?.startsWith('image/');
    
    if (isPdf) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50">
          <File className="h-8 w-8 text-red-600" />
          <span className="text-xs text-red-600 mt-1 font-medium">PDF</span>
        </div>
      );
    }
    
    if (isImage) {
      return <ImageIcon className="h-8 w-8 text-gray-400" />;
    }
    
    return <FileText className="h-8 w-8 text-gray-400" />;
  };

  const getCurrentDocumentIndex = () => {
    if (!previewDocument) return undefined;
    return filteredDocuments.findIndex(d => d.id === previewDocument.id);
  };

  const handleViewDocument = (doc: Document) => {
    setPreviewDocument(doc);
    setShowPreview(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentsApi.getDocumentBlob(doc.id, true);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.original_filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setSelectedCategory(doc.category_id);
    setDescription(doc.description || '');
    setIsPrivate(doc.is_private || false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDocument) return;

    try {
      await documentsApi.update(editingDocument.id, {
        category_id: selectedCategory,
        description: description || undefined,
        is_private: isPrivate
      });
      
      setShowEditModal(false);
      setEditingDocument(null);
      setSelectedCategory(undefined);
      setDescription('');
      setIsPrivate(false);
      
      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to update document:', error);
      alert(error?.response?.data?.detail || 'Failed to update document. Please try again.');
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingDocumentId(docId);
      await documentsApi.delete(docId.toString());
      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Documents Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No documents found</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const thumbnailUrl = getDocumentThumbnail(doc);
            const fileIcon = getFileIcon(doc);
            
            return (
              <div 
                key={doc.id} 
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Thumbnail or Icon */}
                    <div className="w-16 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={doc.original_filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
                          }}
                        />
                      ) : (
                        fileIcon
                      )}
                    </div>
                    
                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Posted on</div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {doc.original_filename}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {doc.category_name && (
                          <span className="font-medium">Type: {doc.category_name}</span>
                        )}
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                        {doc.pages && <span>Pages: {doc.pages}</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Date Created: {formatDate(doc.created_at)}</span>
                        {doc.created_by_name && (
                          <span>
                            Uploaded by{' '}
                            <span className="text-blue-600 hover:text-blue-700">
                              {doc.created_by_name}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* More Actions Dropdown */}
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
                        className="min-w-[180px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                          onSelect={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenu.Item>
                        
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                          onSelect={() => handleDownloadDocument(doc)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </DropdownMenu.Item>
                        
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                          onSelect={() => handleEditDocument(doc)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenu.Item>
                        
                        <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                        
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer outline-none"
                          onSelect={() => handleDeleteDocument(doc.id)}
                          disabled={deletingDocumentId === doc.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingDocumentId === doc.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Attachment</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDescription('');
                  setIsPrivate(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browse
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Private attachment</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Save attachment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditModal && editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Document</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDocument(null);
                  setSelectedCategory(undefined);
                  setDescription('');
                  setIsPrivate(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={editingDocument.original_filename}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Private attachment</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDocument(null);
                  setSelectedCategory(undefined);
                  setDescription('');
                  setIsPrivate(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={showPreview}
        onClose={handleClosePreview}
        onNext={handleNextDocument}
        onPrevious={handlePreviousDocument}
        currentIndex={getCurrentDocumentIndex()}
        totalDocuments={filteredDocuments.length}
      />
    </div>
  );
}
