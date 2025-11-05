import { builder } from '@builder.io/react';

// Use import.meta.env for browser (Vite). Fallback to process.env for server-side.
const BUILDER_PUBLIC_KEY = (typeof window !== 'undefined' && (import.meta as any).env?.VITE_BUILDER_PUBLIC_KEY)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_BUILDER_PUBLIC_KEY)
  || 'your_builder_public_k39bfc067b694403ca329597d360f18f4';

builder.init(BUILDER_PUBLIC_KEY);

export { builder };
