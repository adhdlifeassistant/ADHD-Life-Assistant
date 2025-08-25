'use client';

import React from 'react';
import { UserProfile } from '@/types/profile';
import { WelcomeStep } from './steps/WelcomeStep';
import { IdentityStep } from './steps/IdentityStep';
import { MedicationsStep } from './steps/MedicationsStep';
import { ChronotypeStep } from './steps/ChronotypeStep';
import { ChallengesStep } from './steps/ChallengesStep';
import { ModuleSelectionStep } from './steps/ModuleSelectionStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

interface OnboardingStepsProps {
  currentStep: number;
  formData: Partial<UserProfile>;
  updateFormData: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
}

const steps = [
  {
    id: 0,
    title: 'Bienvenue',
    component: WelcomeStep,
    isValid: () => true, // Toujours valide
  },
  {
    id: 1,
    title: 'Identité',
    component: IdentityStep,
    isValid: (data: Partial<UserProfile>) => (data.name?.trim().length ?? 0) > 0,
  },
  {
    id: 2,
    title: 'Médications',
    component: MedicationsStep,
    isValid: () => true, // Optionnel
    isOptional: true,
  },
  {
    id: 3,
    title: 'Chronotype',
    component: ChronotypeStep,
    isValid: (data: Partial<UserProfile>) => !!data.chronotype,
  },
  {
    id: 4,
    title: 'Défis ADHD',
    component: ChallengesStep,
    isValid: () => true, // Optionnel, peut être vide
  },
  {
    id: 5,
    title: 'Modules préférés',
    component: ModuleSelectionStep,
    isValid: (data: Partial<UserProfile>) => (data.favoriteModules?.length ?? 0) > 0,
  },
  {
    id: 6,
    title: 'Confirmation',
    component: ConfirmationStep,
    isValid: () => true,
  },
];

export function OnboardingSteps({
  currentStep,
  formData,
  updateFormData,
  onNext,
  onPrevious,
  onComplete
}: OnboardingStepsProps) {
  const step = steps[currentStep];
  const StepComponent = step.component;
  
  const isValid = step.isValid(formData);
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <div className="card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Progress bar */}
      <div className="progress-bar m-6 mb-0">
        <div 
          className="progress-bar-fill transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {step.title}
          </h1>
          <div className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 pt-4 module-transition">
        <StepComponent
          data={formData}
          updateData={updateFormData}
          onNext={handleNext}
          onPrevious={onPrevious}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6 pt-0 border-t border-gray-100">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← {isFirst ? 'Retour au menu' : 'Précédent'}
        </button>
        
        <div className="flex items-center gap-2">
          {/* Step indicators */}
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        <button
          onClick={handleNext}
          disabled={!isValid && !step.isOptional}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLast ? '🎉 Commencer !' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}