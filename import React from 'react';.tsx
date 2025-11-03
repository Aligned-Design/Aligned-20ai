import React from 'react';

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Aligned 20 AI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Fusion Starter Template Ready for Builder.io
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <p className="text-sm text-gray-500">
            Built with React Router 6 SPA + TypeScript + Vite
          </p>
        </div>
      </div>
    </div>
  );
}

export default Index;
