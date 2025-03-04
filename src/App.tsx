import { useState } from 'react'
import Layout from '@/components/Layout'
import FileUploader from '@/components/FileUploader'
import DocumentList from '@/components/DocumentList'
import QueryInterface from '@/components/QueryInterface'
import ResponseDisplay from '@/components/ResponseDisplay'
import { QueryResponse } from '@/types'

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (newDocument: Document) => {
    setDocuments(prev => [...prev, newDocument]);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc?.id !== documentId));
  };

  const handleQuerySuccess = (queryResponse: QueryResponse) => {
    setResponse(queryResponse);
    setError(null);
  };

  const handleQueryError = (errorMessage: string) => {
    setError(errorMessage);
    setResponse(null);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-1 space-y-6">
          <FileUploader 
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
          <DocumentList 
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>
        <div className="md:col-span-2 space-y-6">
          <QueryInterface 
            isQuerying={isQuerying}
            setIsQuerying={setIsQuerying}
            onSuccess={handleQuerySuccess}
            onError={handleQueryError}
            documentsAvailable={documents.length > 0}
          />
          {response && (
            <ResponseDisplay response={response} />
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;