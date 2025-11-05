import React, { useState } from 'react';
import { BrandIntakeForm } from '@/components/brand/BrandIntakeForm';
import { AssetUploader } from '@/components/brand/AssetUploader';
import type { BrandIntakeRequest, BrandKitResponse } from '@shared/api';

export default function BrandKitBuilder() {
  const [brandKit, setBrandKit] = useState<BrandKitResponse | null>(null);

  const handleFormSubmit = async (data: BrandIntakeRequest) => {
    try {
      const response = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result: BrandKitResponse = await response.json();
      if (result.success) {
        setBrandKit(result);
      }
    } catch (error) {
      console.error('Failed to create brand kit:', error);
    }
  };

  const handleFormSave = async (data: Partial<BrandIntakeRequest>) => {
    // Auto-save logic
    try {
      await fetch('/api/brand-kit/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  if (brandKit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Brand Kit Created Successfully! 🎉</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{brandKit.brandKit.brandName}</h2>
          <p className="text-gray-600 mb-4">Version {brandKit.brandKit.version}</p>
          
          {/* Brand Kit Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Brand Identity</h3>
              <p className="text-sm text-gray-600">{brandKit.brandKit.identity.mission}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Color Palette</h3>
              <div className="flex gap-2">
                {brandKit.brandKit.visual.colors.primary.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your Brand Kit</h1>
      
      <BrandIntakeForm
        onSubmit={handleFormSubmit}
        onSave={handleFormSave}
      />
    </div>
  );
}
