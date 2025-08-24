'use client';

import React from 'react';
import { SettingsInterface } from '@/components/settings/SettingsInterface';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <SettingsInterface />
      </div>
    </div>
  );
}