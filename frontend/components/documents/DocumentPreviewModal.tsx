'use client';

import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Printer, Search } from 'lucide-react';
import { documentsApi } from '@/lib/api';

interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_size?: number;
  file_type?: string;
  mime_type?: string;
  pages?: number;
  category_name?: string;
  created_at: string;
  created_by_name?: string;
}

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalDocuments?: number;
}

export default function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalDocuments,
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (isOpen && document) {
      // Reset zoom and page when opening
      setZoom(100);
      setCurrentPage(1);
      setLoading(true);
      setError('');
      
      // Fetch document as blob and create object URL
      documentsApi.getDocumentBlob(document.id, false)
        .then(blob => {
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setDocumentUrl(url);
            setLoading(false);
            setError('');
          } else {
            setError('Document file is empty or corrupted');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to load document:', err);
          const errorMessage = err?.message || 'Failed to load document. Please try downloading it instead.';
          setError(errorMessage);
          setLoading(false);
        });
      
      // Prevent body scroll when modal is open
      if (window.document && window.document.body) {
        window.document.body.style.overflow = 'hidden';
      }
    } else {
      // Clean up object URL when modal closes
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
        setDocumentUrl('');
      }
      if (window.document && window.document.body) {
        window.document.body.style.overflow = 'unset';
      }
    }

    return () => {
      if (window.document && window.document.body) {
        window.document.body.style.overflow = 'unset';
      }
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const handleDownload = async () => {
    try {
      const blob = await documentsApi.getDocumentBlob(document.id, true);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.original_filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Failed to download document');
    }
  };

  const handlePrint = () => {
    if (documentUrl) {
      const printWindow = window.open(documentUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const isImage = document.mime_type?.startsWith('image/');
  const isPdf = document.mime_type?.includes('pdf') || document.file_type?.includes('pdf');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full max-w-7xl max-h-screen mx-4 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {document.original_filename}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls (for images and PDFs) */}
            {(isImage || isPdf) && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={zoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={zoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Page Navigation (for PDFs) */}
            {isPdf && document.pages && document.pages > 1 && (
              <div className="flex items-center gap-2 mr-2 border-l pl-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} of {document.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(document.pages || 1, currentPage + 1))}
                  disabled={currentPage === document.pages}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Document Navigation */}
            {totalDocuments && totalDocuments > 1 && currentIndex !== undefined && (
              <div className="flex items-center gap-2 mr-2 border-l pl-2">
                <button
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous document"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {totalDocuments}
                </span>
                <button
                  onClick={onNext}
                  disabled={currentIndex === totalDocuments - 1}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next document"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="flex items-center justify-center min-h-full p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Download
                </button>
              </div>
            ) : isImage ? (
              <img
                src={documentUrl}
                alt={document.original_filename}
                className="max-w-full h-auto shadow-lg"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : isPdf ? (
              <iframe
                src={`${documentUrl}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full min-h-[600px] bg-white shadow-lg"
                title={document.original_filename}
              />
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Preview not available for this file type
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Document Info */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              {document.category_name && (
                <span className="font-medium">Type: {document.category_name}</span>
              )}
              <span>Size: {formatFileSize(document.file_size)}</span>
              {document.pages && <span>Pages: {document.pages}</span>}
            </div>
            <div className="flex items-center gap-4">
              <span>Date Created: {formatDate(document.created_at)}</span>
              {document.created_by_name && (
                <span>
                  Uploaded by{' '}
                  <span className="text-blue-600">{document.created_by_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

