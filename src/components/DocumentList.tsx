import React from 'react';
import axios from 'axios';
import { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDeleteDocument }) => {
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await axios.delete(`/api/documents/${documentId}`);
      if (response.data.success) {
        onDeleteDocument(documentId);
      } else {
        throw new Error(response.data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  // Format file type for display
  const formatFileType = (fileType: string) => {
    return fileType.charAt(0).toUpperCase() + fileType.slice(1);
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Uploaded Documents
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          No documents uploaded yet. Upload code files to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Uploaded Documents
      </h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {documents.map((doc) => (
          <li key={doc.id} className="py-3 flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {doc.name}
              </p>
              <div className="flex space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  {formatFileType(doc.fileType)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteDocument(doc.id)}
              className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="Delete document"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;