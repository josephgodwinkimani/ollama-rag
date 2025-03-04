import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface RelevantChunk {
  filename?: string;
  content: string;
  language?: string;
  similarity: number;
}

interface SourceDocumentViewProps {
  chunk: RelevantChunk;
  index: number;
}

export const SourceDocumentView: React.FC<SourceDocumentViewProps> = ({ chunk, index }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
      <span className="font-medium text-gray-800 dark:text-gray-200">
        {chunk.filename || `Document ${index + 1}`}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Similarity: {(chunk.similarity * 100).toFixed(2)}%
      </span>
    </div>
    <div className="p-1">
      <SyntaxHighlighter
        language={chunk.language || 'typescript'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: '0.25rem' }}
      >
        {chunk.content}
      </SyntaxHighlighter>
    </div>
  </div>
);