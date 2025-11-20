'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { contactsApi } from '@/lib/api';

interface ImportResult {
  row_number: number;
  success: boolean;
  contact_id?: number;
  display_name?: string;
  error?: string;
}

interface ImportResponse {
  total_rows: number;
  successful: number;
  failed: number;
  results: ImportResult[];
}

export default function ImportContactsPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Only CSV files are supported. Please save your Excel file as CSV format.');
        setSelectedFile(null);
        return;
      }
      setError('');
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file to import');
      return;
    }

    try {
      setImporting(true);
      setError('');
      const result = await contactsApi.import(selectedFile);
      setImportResult(result);
    } catch (err: any) {
      console.error('Error importing contacts:', err);
      setError(err?.response?.data?.detail || 'Failed to import contacts. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/contacts')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Contacts
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Import Contacts</h1>
          <p className="mt-2 text-gray-600">Import contacts from a CSV file</p>
        </div>

        {/* File Selection */}
        {!importResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select a file from your computer to import
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-sm font-medium text-gray-700 mb-2">
                  {selectedFile ? selectedFile.name : 'Select file'}
                </span>
                <span className="text-xs text-gray-500">
                  Click to browse or drag and drop
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important Notes:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Currently only CSV files are supported. If you're using Excel, you can use "Save As" to save your contacts in CSV format.</li>
                  <li>Please also be aware that this process does not check for duplicates.</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Exporting contacts from other systems
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Here are some resources to help you export your contacts from other systems:
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  • Microsoft Outlook export guide
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  • Google Contacts export guide
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Once you have exported your contacts from another system into a CSV file, you can upload it here.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Import Contacts
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Import Results</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Import Another File
                </button>
                <button
                  onClick={() => router.push('/contacts')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Contacts
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.total_rows}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-700">{importResult.successful}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
              </div>
            </div>

            {/* Results List */}
            {importResult.results.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importResult.results.map((result, idx) => (
                        <tr key={idx} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.row_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.display_name || '-'}</td>
                          <td className="px-4 py-3">
                            {result.success ? (
                              <span className="inline-flex items-center gap-1 text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-700">
                                <AlertCircle className="h-4 w-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {result.success ? (
                              <span className="text-green-700">Contact imported successfully</span>
                            ) : (
                              <span className="text-red-700">{result.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

