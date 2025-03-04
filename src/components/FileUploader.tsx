import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Document, UploadResponse } from '@/types';

interface FileUploaderProps {
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  onSuccess: (document: Document) => void;
  onError: (errorMessage: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  isUploading,
  setIsUploading,
  onSuccess,
  onError
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setIsUploading(true);
      
      // Process each file
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post<UploadResponse>(
          '/api/documents/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data.success && response.data.document) {
          onSuccess(response.data.document);
        } else {
          throw new Error(response.data.message || 'Failed to upload file');
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      onError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [setIsUploading, onSuccess, onError]);

  // c/p from OllamaCoder
  const allowedExtensions = [
    '.bash',
    '.sh', // Bash
    '.c', // C
    '.cpp',
    '.cc',
    '.h', // C++
    '.cs', // C#
    '.css', // CSS
    'Dockerfile', // Docker
    '.go', // Go
    '.graphql',
    '.gql', // GraphQL
    '.java', // Java
    '.js',
    '.jsx', // JavaScript
    '.json', // JSON
    '.kt',
    '.kts', // Kotlin
    '.tex', // LaTeX
    '.md',
    '.markdown', // Markdown
    '.m',
    '.mat', // MATLAB
    '.pl',
    '.pm', // Perl
    '.php', // PHP
    '.py', // Python
    '.r', // R
    '.rb', // Ruby
    '.rs', // Rust
    '.scala',
    '.sc', // Scala
    '.sql', // SQL
    '.swift', // Swift
    '.ts',
    '.tsx', // TypeScript
    '.yml',
    '.yaml', // YAML
    '.txt', // Plain text
    '.scss',
    '.sass', // SASS/SCSS
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': allowedExtensions,
    },
    disabled: isUploading,
    multiple: true
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Upload Code Files
      </h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-300">Uploading...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported file types: {allowedExtensions.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;