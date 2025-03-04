import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QueryResponse } from '@/types';

interface ResponseDisplayProps {
  response: QueryResponse;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const [showSourceCode, setShowSourceCode] = useState(false);
  
  // Format processing time
  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Detect code blocks in the response and apply syntax highlighting
  const formatResponse = (text: string) => {
    // Simple regex to detect code blocks (```language...```)
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-4">
            {text.substring(lastIndex, match.index)}
          </p>
        );
      }

      // Add code block with syntax highlighting
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <div key={`code-${match.index}`} className="mb-4">
          <SyntaxHighlighter language={language} style={vscDarkPlus} className="rounded-md">
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap">{text}</p>;
  };

  // Determine if the content appears to be code to apply proper formatting
  const detectLanguage = (content: string) => {
    if (content.includes('function ') || content.includes('const ') || content.includes('import ') || 
        content.includes('export ') || content.includes('class ')) {
      if (content.includes('import React') || content.includes('className=') || content.includes('<div>')) {
        return 'tsx';
      }
      if (content.includes('<') && content.includes('>') && content.includes('</')) {
        return 'html';
      }
      return 'javascript';
    }
    if (content.includes('def ') || content.includes('import ') && content.includes(':')) {
      return 'python';
    }
    return 'text';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Response</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Processed in {formatProcessingTime(response?.processingTime)}
          </span>
        </div>
        
        {response.success ? (
          <div>
            <div className="prose dark:prose-invert max-w-none">
              {formatResponse(response?.answer)}
            </div>
            
            {response.relevantChunks && response.relevantChunks.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Source Documents</h3>
                  <button 
                    onClick={() => setShowSourceCode(!showSourceCode)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {showSourceCode ? 'Hide Sources' : 'Show Sources'}
                  </button>
                </div>
                
                {showSourceCode && (
                  <div className="space-y-4">
                    {response.relevantChunks.map((chunk, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            {chunk.documentName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Similarity: {(chunk?.similarity * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="px-4 py-3">
                          <SyntaxHighlighter 
                            language={detectLanguage(chunk?.content)} 
                            style={vscDarkPlus}
                            customStyle={{ margin: 0 }}
                            className="rounded-md"
                          >
                            {chunk?.content}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-500 dark:text-red-400">
            <p className="font-medium mb-1">Error</p>
            <p>{response.error || 'An unknown error occurred'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseDisplay;