'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/AuthContext';
import AuthSelector from '@/components/auth/AuthSelector';

export default function AuthPage() {
  const router = useRouter();

  // Page invisible de redirection - traitement legacy
  useEffect(() => {
    console.log('🔄 DEBUG AUTH PAGE - Page auth legacy, redirection vers /settings...');
    
    // Redirection immédiate vers /settings avec query params si présents
    const urlParams = new URLSearchParams(window.location.search);
    const queryString = urlParams.toString();
    const redirectUrl = queryString ? `/settings?${queryString}` : '/settings';
    
    router.replace(redirectUrl);
  }, [router]);

  // Page invisible de redirection - ne rien afficher
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center animate-spin">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirection...
        </h2>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span className="text-gray-600">Un instant</span>
        </div>
      </div>
    </div>
  );
}