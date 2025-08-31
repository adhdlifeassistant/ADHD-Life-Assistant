'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProfile } from './useProfile';
import { useMood } from '@/modules/mood/MoodContext';
import { ProfileEvolutionEngine, ProfileEvolutionData } from '@/lib/profileEvolution';
import { MoodType } from '@/types/mood';

export function useProfileEvolution() {
  const { profile } = useProfile();
  const { currentMood } = useMood();
  const [evolutionEngine, setEvolutionEngine] = useState<ProfileEvolutionEngine | null>(null);
  const [evolutionData, setEvolutionData] = useState<ProfileEvolutionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialiser le moteur d'évolution
  useEffect(() => {
    if (profile) {
      const engine = ProfileEvolutionEngine.getInstance(profile);
      setEvolutionEngine(engine);
    }
  }, [profile]);

  // Écouter les mises à jour d'évolution
  useEffect(() => {
    const handleEvolutionUpdate = (event: CustomEvent) => {
      setEvolutionData(event.detail);
    };

    window.addEventListener('profileEvolutionUpdate', handleEvolutionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileEvolutionUpdate', handleEvolutionUpdate as EventListener);
    };
  }, []);

  // Enregistrer une activité
  const recordActivity = useCallback((
    moduleId: string, 
    action: string, 
    duration?: number, 
    metadata?: any
  ) => {
    if (evolutionEngine) {
      evolutionEngine.recordActivity(moduleId, action, currentMood, duration, metadata);
    }
  }, [evolutionEngine, currentMood]);

  // Enregistrer un changement d'humeur
  const recordMoodChange = useCallback((
    mood: MoodType, 
    context?: string, 
    triggers?: string[]
  ) => {
    if (evolutionEngine) {
      evolutionEngine.recordMoodChange(mood, context, triggers);
    }
  }, [evolutionEngine]);

  // Analyser l'évolution complète
  const analyzeEvolution = useCallback(async () => {
    if (!evolutionEngine) return null;
    
    setIsAnalyzing(true);
    
    try {
      // Simulation d'analyse (en réalité instantané)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const evolution = evolutionEngine.analyzeEvolution();
      setEvolutionData(evolution);
      
      return evolution;
    } catch (error) {
      console.error('Erreur analyse évolution:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [evolutionEngine]);

  // Obtenir des recommandations personnalisées
  const getPersonalizedRecommendations = useCallback(() => {
    if (!evolutionData) return [];
    
    return evolutionData.adaptiveRecommendations.routineOptimizations
      .sort((a, b) => b.potentialImpact - a.potentialImpact)
      .slice(0, 3);
  }, [evolutionData]);

  // Obtenir les insights sur les patterns d'humeur
  const getMoodInsights = useCallback(() => {
    if (!evolutionData) return null;
    
    const { moodPatterns } = evolutionData;
    
    return {
      dominantMood: moodPatterns.dominant,
      moodStability: calculateMoodStability(moodPatterns.frequency),
      optimalHours: getOptimalMoodHours(moodPatterns.timePatterns),
      triggers: moodPatterns.triggers.filter(t => t.confidence > 0.7)
    };
  }, [evolutionData]);

  // Obtenir les suggestions d'amélioration du profil
  const getProfileImprovements = useCallback(() => {
    if (!evolutionData) return [];
    
    const improvements = [];
    const { profileMaturity } = evolutionData;
    
    // Basé sur la maturité du profil
    if (profileMaturity.completeness < 50) {
      improvements.push({
        type: 'completion',
        title: 'Enrichir ton profil',
        description: `Ton profil est complet à ${profileMaturity.completeness}%. Plus d'infos = meilleure personnalisation !`,
        priority: 'high' as const,
        actions: profileMaturity.nextMilestones.slice(0, 2)
      });
    }

    // Nouveaux défis détectés
    evolutionData.adaptiveRecommendations.newChallengesDetected.forEach(challenge => {
      if (challenge.confidence > 0.6) {
        improvements.push({
          type: 'challenge',
          title: `Nouveau défi détecté : ${challenge.challengeId}`,
          description: `Basé sur ton usage, tu pourrais bénéficier d'outils pour ce défi.`,
          priority: 'medium' as const,
          actions: [`Ajouter "${challenge.challengeId}" à tes défis ADHD`]
        });
      }
    });

    // Optimisations comportementales
    evolutionData.adaptiveRecommendations.routineOptimizations.forEach(optimization => {
      if (optimization.potentialImpact > 70) {
        improvements.push({
          type: 'optimization',
          title: `Optimisation ${optimization.type}`,
          description: optimization.suggestion,
          priority: 'medium' as const,
          actions: [`Impact potentiel: ${optimization.potentialImpact}%`]
        });
      }
    });

    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [evolutionData]);

  // Obtenir les statistiques d'engagement
  const getEngagementStats = useCallback(() => {
    if (!evolutionData) return null;
    
    const { behaviorInsights } = evolutionData;
    
    return {
      mostUsedModule: behaviorInsights.mostUsedModules[0]?.moduleId || 'none',
      diversityScore: behaviorInsights.mostUsedModules.length,
      challengeProgress: behaviorInsights.challengeProgress.map(cp => ({
        challenge: cp.challengeId,
        progress: Math.round(cp.improvement)
      })),
      chronotypeAccuracy: behaviorInsights.chronotypeAccuracy.confidence
    };
  }, [evolutionData]);

  return {
    // État
    evolutionData,
    isAnalyzing,
    isInitialized: !!evolutionEngine,
    
    // Actions
    recordActivity,
    recordMoodChange,
    analyzeEvolution,
    
    // Getters
    getPersonalizedRecommendations,
    getMoodInsights,
    getProfileImprovements,
    getEngagementStats,
    
    // État du profil
    profileMaturity: evolutionData?.profileMaturity || null
  };
}

// Fonctions utilitaires
function calculateMoodStability(frequency: Record<MoodType, number>): number {
  const total = Object.values(frequency).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0.5;
  
  const maxFreq = Math.max(...Object.values(frequency));
  return maxFreq / total;
}

function getOptimalMoodHours(timePatterns: Array<{hour: number; mood: MoodType; frequency: number}>): number[] {
  return timePatterns
    .filter(tp => ['energetic', 'normal'].includes(tp.mood))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 4)
    .map(tp => tp.hour);
}