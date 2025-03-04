import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Code RAG Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Upload code files and query your codebase using Ollama models
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;