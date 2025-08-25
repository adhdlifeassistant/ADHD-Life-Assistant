'use client';

import { useState, useEffect } from 'react';
import { UserProfile, ProfileMedication, ADHDChallenge } from '@/types/profile';

const STORAGE_KEY = 'adhd-user-profile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: undefined,
  medications: [],
  chronotype: 'flexible',
  challenges: [],
  favoriteModules: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  onboardingCompleted: false
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le profil au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProfile = JSON.parse(stored) as UserProfile;
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder le profil
  const saveProfile = (updates: Partial<UserProfile>) => {
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: Date.now()
    };
    
    setProfile(updatedProfile);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  // Méthodes spécifiques
  const updateName = (name: string) => {
    saveProfile({ name });
  };

  const updateAge = (age?: number) => {
    saveProfile({ age });
  };

  const updateChronotype = (chronotype: UserProfile['chronotype']) => {
    saveProfile({ chronotype });
  };

  const updateChallenges = (challenges: ADHDChallenge[]) => {
    saveProfile({ challenges });
  };

  const updateFavoriteModules = (favoriteModules: string[]) => {
    saveProfile({ favoriteModules });
  };

  const addMedication = (medication: Omit<ProfileMedication, 'id'>) => {
    const newMedication: ProfileMedication = {
      ...medication,
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedMedications = [...profile.medications, newMedication];
    saveProfile({ medications: updatedMedications });
  };

  const updateMedication = (id: string, updates: Partial<ProfileMedication>) => {
    const updatedMedications = profile.medications.map(med =>
      med.id === id ? { ...med, ...updates } : med
    );
    saveProfile({ medications: updatedMedications });
  };

  const removeMedication = (id: string) => {
    const updatedMedications = profile.medications.filter(med => med.id !== id);
    saveProfile({ medications: updatedMedications });
  };

  const completeOnboarding = () => {
    saveProfile({ onboardingCompleted: true });
  };

  const clearProfile = () => {
    const resetProfile = {
      ...DEFAULT_PROFILE,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setProfile(resetProfile);
    localStorage.removeItem(STORAGE_KEY);
  };

  const importProfile = (profileData: UserProfile) => {
    try {
      const validatedProfile = {
        ...DEFAULT_PROFILE,
        ...profileData,
        updatedAt: Date.now()
      };
      setProfile(validatedProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedProfile));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import du profil:', error);
      return false;
    }
  };

  // Getters utiles
  const hasProfile = profile.name.length > 0;
  const needsOnboarding = !profile.onboardingCompleted;
  const hasMedications = profile.medications.length > 0;
  
  // Recommandations basées sur le profil
  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    // Basé sur le chronotype
    if (profile.chronotype === 'morning') {
      recommendations.push('Planifiez vos tâches importantes le matin');
    } else if (profile.chronotype === 'evening') {
      recommendations.push('Gardez les tâches créatives pour le soir');
    }
    
    // Basé sur les défis
    profile.challenges.forEach(challenge => {
      switch (challenge) {
        case 'organization':
          recommendations.push('Utilisez le module Organisation pour structurer votre quotidien');
          break;
        case 'impulse-spending':
          recommendations.push('Activez les réflexions anti-impulsion dans le module Finances');
          break;
        case 'cleaning-tidying':
          recommendations.push('Essayez les sessions courtes du module Ménage');
          break;
        case 'memory-forgetting':
          recommendations.push('Configurez des rappels pour vos tâches importantes');
          break;
      }
    });
    
    return recommendations.slice(0, 3); // Limiter à 3 recommandations
  };

  return {
    // État
    profile,
    isLoading,
    hasProfile,
    needsOnboarding,
    hasMedications,
    
    // Actions
    saveProfile,
    updateName,
    updateAge,
    updateChronotype,
    updateChallenges,
    updateFavoriteModules,
    addMedication,
    updateMedication,
    removeMedication,
    completeOnboarding,
    clearProfile,
    importProfile,
    
    // Utilitaires
    getPersonalizedRecommendations
  };
}