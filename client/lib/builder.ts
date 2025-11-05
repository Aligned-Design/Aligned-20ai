import { builder } from '@builder.io/react';

// Replace with your actual Builder.io public API key
builder.init(process.env.VITE_BUILDER_PUBLIC_KEY || 'your-public-key-here');

export { builder };
