import { BuilderComponent, useIsPreviewing } from '@builder.io/react';

interface BuilderPageProps {
  model: string;
  content?: any;
}

export function BuilderPage({ model, content }: BuilderPageProps) {
  const isPreviewing = useIsPreviewing();
  
  // Show Builder.io content if available, fallback to default
  if (content || isPreviewing) {
    return (
      <BuilderComponent 
        model={model} 
        content={content}
      />
    );
  }

  // Fallback when no content is available
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Content Loading...
        </h1>
        <p className="text-gray-600 mt-2">
          Builder.io content will appear here
        </p>
      </div>
    </div>
  );
}
