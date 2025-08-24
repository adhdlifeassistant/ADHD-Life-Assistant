'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { UserProfile } from '@/types/profile';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile, completeOnboarding } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: undefined,
    medications: [],
    chronotype: 'flexible',
    challenges: []
  });

  const updateFormData = (updates: Partial<UserProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    // Sauvegarder le profil complet
    saveProfile(formData);
    completeOnboarding();
    
    // Rediriger vers le dashboard
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingSteps
          currentStep={currentStep}
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}