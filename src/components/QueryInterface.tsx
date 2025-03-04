import React, { useState } from 'react';
import axios from 'axios';
import { QueryResponse } from '@/types';

interface QueryInterfaceProps {
  isQuerying: boolean;
  setIsQuerying: (isQuerying: boolean) => void;
  onSuccess: (response: QueryResponse) => void;
  onError: (errorMessage: string) => void;
  documentsAvailable: boolean;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  isQuerying,
  setIsQuerying,
  onSuccess,
  onError,
  documentsAvailable
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !documentsAvailable) return;
    
    try {
      setIsQuerying(true);
      
      const response = await axios.post<QueryResponse>('/api/query', { query });
      
      if (response.data.success) {
        onSuccess(response.data);
      } else {
        throw new Error(response.data.error || 'Failed to query documents');
      }
    } catch (error: any) {
      console.error('Error querying documents:', error);
      onError(error.message || 'Failed to query documents');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Ask About Your Code
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="query" className="sr-only">Your question</label>
          <textarea
            id="query"
            name="query"
            rows={3}
            className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
            placeholder={documentsAvailable 
              ? "Ask a question about your code, e.g., 'What does the authentication function do?' or 'How is data being processed in this file?'" 
              : "Upload some code files first to ask questions"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isQuerying || !documentsAvailable}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isQuerying || !query.trim() || !documentsAvailable}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isQuerying || !query.trim() || !documentsAvailable
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isQuerying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Ask Question'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QueryInterface;