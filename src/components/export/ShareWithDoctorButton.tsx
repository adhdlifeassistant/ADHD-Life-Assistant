'use client';

import { useState } from 'react';
import { ExportModal } from './ExportModal';

interface ShareWithDoctorButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export function ShareWithDoctorButton({ 
  className = '', 
  variant = 'primary',
  size = 'md' 
}: ShareWithDoctorButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:ring-4 focus:outline-none';
    
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantStyles = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-200',
      secondary: 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
      icon: 'bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-full focus:ring-blue-200'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  const getButtonContent = () => {
    if (variant === 'icon') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      );
    }

    return (
      <>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Partager avec médecin
      </>
    );
  };

  return (
    <>
      <button
        onClick={() => setShowExportModal(true)}
        className={getButtonStyles()}
        title="Exporter vos données ADHD pour votre médecin"
      >
        {getButtonContent()}
      </button>

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}