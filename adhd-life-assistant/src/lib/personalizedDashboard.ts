'use client';

import { UserProfile, CHRONOTYPES, ADHD_CHALLENGES, ADHDChallenge } from '@/types/profile';
import { MoodType } from '@/types/mood';

export interface PersonalizedDashboardContext {
  profile: UserProfile;
  currentMood: MoodType;
  currentTime: Date;
}

// Messages d'accueil personnalisés selon profil + mood
export function getPersonalizedDashboardGreeting(context: PersonalizedDashboardContext): string {
  const { profile, currentMood, currentTime } = context;
  const name = profile.name || '';
  const hour = currentTime.getHours();
  
  // Déterminer le moment selon chronotype
  let timeContext = '';
  if (profile.chronotype) {
    const chronotypeData = CHRONOTYPES[profile.chronotype];
    const isOptimalTime = chronotypeData.peakHours.includes(hour);
    
    if (isOptimalTime) {
      timeContext = profile.chronotype === 'morning' 
        ? ' Tu es dans ton créneau productif du matin !' 
        : profile.chronotype === 'evening' 
        ? ' Parfait, c\'est ton moment de la journée !' 
        : ' C\'est un bon moment pour toi !';
    } else {
      timeContext = profile.chronotype === 'morning' && hour > 14
        ? ' L\'après-midi est plus calme pour toi, c\'est normal.'
        : profile.chronotype === 'evening' && hour < 12
        ? ' Le matin n\'est pas ton fort, on y va à ton rythme.'
        : '';
    }
  }

  // Messages selon mood et profil
  const greetings = {
    energetic: [
      `Salut ${name} ! ⚡ Belle énergie aujourd'hui !${timeContext}`,
      `Hey ${name} ! 🌟 Je sens que tu pètes le feu !${timeContext}`,
      `${name} ! 🚀 Prêt pour une journée productive ?${timeContext}`
    ],
    normal: [
      `Bonjour ${name} ! 😊 Comment tu te sens aujourd'hui ?${timeContext}`,
      `Salut ${name} ! 🌸 Une journée équilibrée qui commence.${timeContext}`,
      `Hey ${name} ! ✨ Prêt pour cette journée ?${timeContext}`
    ],
    tired: [
      `Salut ${name}... 😴 Journée un peu lourde ?${timeContext}`,
      `Hey ${name} 💙 On va prendre ça tranquille aujourd'hui.${timeContext}`,
      `${name}, pas de pression aujourd'hui. 🤗${timeContext}`
    ],
    stressed: [
      `Salut ${name} 🫂 Je sens du stress... Respire un coup.${timeContext}`,
      `Hey ${name} 💙 Ça semble tendu. On va y aller étape par étape.${timeContext}`,
      `${name}, tout va bien se passer. 🌸${timeContext}`
    ],
    sad: [
      `Salut ${name} 💜 Jour difficile ? Je suis là pour toi.${timeContext}`,
      `Hey ${name} 🤗 Prends ton temps aujourd'hui.${timeContext}`,
      `${name} 💙 Pas besoin d'être fort en permanence.${timeContext}`
    ]
  };

  if (!name) {
    // Fallback si pas de nom
    return currentMood === 'energetic' ? 'Salut ! Comment tu te sens aujourd\'hui ?' :
           currentMood === 'tired' ? 'Salut... Comment ça va ?' :
           currentMood === 'stressed' ? 'Salut, respire un coup. Comment ça va ?' :
           currentMood === 'sad' ? 'Salut, je suis là pour toi.' :
           'Salut ! Comment tu te sens aujourd\'hui ?';
  }

  const moodGreetings = greetings[currentMood] || greetings.normal;
  return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
}

// Suggestions selon chronotype et heure
export function getChronotypeTimingSuggestions(context: PersonalizedDashboardContext): string | null {
  const { profile, currentTime } = context;
  const hour = currentTime.getHours();
  
  if (!profile.chronotype) return null;
  
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  const isOptimalTime = chronotypeData.peakHours.includes(hour);
  
  if (isOptimalTime) {
    return `🌟 C'est ton créneau productif ! Profite de ces heures pour tes tâches importantes.`;
  } else {
    if (profile.chronotype === 'morning' && hour > 15) {
      return `😊 L'après-midi est ton moment calme. Parfait pour les tâches légères ou créatives.`;
    } else if (profile.chronotype === 'evening' && hour < 14) {
      return `🌅 Le matin n'est pas ton fort. Commence doucement, tu seras plus efficace ce soir !`;
    } else {
      return `⏰ Pas ton créneau optimal, mais ça ne veut pas dire que tu ne peux pas bien faire !`;
    }
  }
}

// Prédire les modules prioritaires selon défis ADHD
export function getPriorityModulesForChallenges(challenges: ADHDChallenge[]): Array<{
  moduleId: string;
  priority: number;
  reason: string;
}> {
  const modulePriorities: Array<{moduleId: string; priority: number; reason: string}> = [];
  
  challenges.forEach(challengeId => {
    const challenge = ADHD_CHALLENGES[challengeId];
    if (!challenge) return;
    
    switch (challengeId) {
      case 'organization':
        modulePriorities.push({
          moduleId: 'checklists',
          priority: 10,
          reason: 'Les checklists t\'aident à structurer tes journées'
        });
        modulePriorities.push({
          moduleId: 'tasks',
          priority: 8,
          reason: 'Gestion des tâches pour ton défi organisation'
        });
        break;
        
      case 'impulse-spending':
        modulePriorities.push({
          moduleId: 'finance',
          priority: 10,
          reason: 'Contrôle tes achats impulsifs avec des outils adaptés'
        });
        break;
        
      case 'cleaning-tidying':
        modulePriorities.push({
          moduleId: 'cleaning',
          priority: 10,
          reason: 'Ménage gamifié pour ton défi rangement'
        });
        break;
        
      case 'memory-forgetting':
        modulePriorities.push({
          moduleId: 'reminders',
          priority: 9,
          reason: 'Rappels intelligents pour ne rien oublier'
        });
        modulePriorities.push({
          moduleId: 'checklists',
          priority: 7,
          reason: 'Listes anti-oublis pour ta mémoire'
        });
        break;
        
      case 'time-management':
        modulePriorities.push({
          moduleId: 'focus',
          priority: 9,
          reason: 'Sessions pomodoro pour ta gestion du temps'
        });
        modulePriorities.push({
          moduleId: 'tasks',
          priority: 7,
          reason: 'Planification des tâches selon le temps disponible'
        });
        break;
        
      case 'procrastination':
        modulePriorities.push({
          moduleId: 'focus',
          priority: 8,
          reason: 'Sessions courtes pour vaincre la procrastination'
        });
        modulePriorities.push({
          moduleId: 'chat',
          priority: 6,
          reason: 'Claude peut te motiver à commencer'
        });
        break;
        
      case 'emotional-regulation':
        modulePriorities.push({
          moduleId: 'health',
          priority: 8,
          reason: 'Suivi de ton bien-être émotionnel'
        });
        modulePriorities.push({
          moduleId: 'chat',
          priority: 7,
          reason: 'Support émotionnel avec Claude'
        });
        break;
        
      case 'sleep-routine':
        modulePriorities.push({
          moduleId: 'health',
          priority: 9,
          reason: 'Tracking de ton sommeil et routines'
        });
        break;
        
      case 'social-relationships':
        modulePriorities.push({
          moduleId: 'reminders',
          priority: 6,
          reason: 'Rappels pour rester en contact avec tes proches'
        });
        break;
        
      case 'hyperfocus-distraction':
        modulePriorities.push({
          moduleId: 'focus',
          priority: 10,
          reason: 'Gestion équilibrée de ton attention'
        });
        modulePriorities.push({
          moduleId: 'analytics',
          priority: 5,
          reason: 'Comprendre tes patterns d\'attention'
        });
        break;
    }
  });
  
  // Fusionner les priorités pour les modules répétés
  const mergedPriorities = new Map<string, {priority: number, reason: string}>();
  
  modulePriorities.forEach(item => {
    const existing = mergedPriorities.get(item.moduleId);
    if (existing) {
      mergedPriorities.set(item.moduleId, {
        priority: Math.max(existing.priority, item.priority),
        reason: item.priority > existing.priority ? item.reason : existing.reason
      });
    } else {
      mergedPriorities.set(item.moduleId, { priority: item.priority, reason: item.reason });
    }
  });
  
  return Array.from(mergedPriorities.entries())
    .map(([moduleId, data]) => ({ moduleId, ...data }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4); // Top 4 modules
}

// Obtenir les médications du jour avec status
export function getTodayMedications(profile: UserProfile): Array<{
  id: string;
  name: string;
  time: string;
  status: 'upcoming' | 'now' | 'missed' | 'taken';
  timeUntil?: string;
}> {
  if (!profile.medications || profile.medications.length === 0) return [];
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  return profile.medications.map(med => {
    const [medHour, medMinute] = med.time.split(':').map(Number);
    const medTimeInMinutes = medHour * 60 + medMinute;
    
    let status: 'upcoming' | 'now' | 'missed' | 'taken' = 'upcoming';
    let timeUntil = '';
    
    const diffMinutes = medTimeInMinutes - currentTimeInMinutes;
    
    if (diffMinutes > 30) {
      status = 'upcoming';
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      timeUntil = hours > 0 ? `dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `dans ${minutes}min`;
    } else if (diffMinutes > 0 && diffMinutes <= 30) {
      status = 'now';
      timeUntil = `dans ${diffMinutes}min`;
    } else if (diffMinutes >= -30) {
      status = 'now';
      timeUntil = 'maintenant';
    } else {
      status = 'missed';
      timeUntil = 'en retard';
    }
    
    return {
      id: med.id,
      name: med.name,
      time: med.time,
      status,
      timeUntil
    };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

// Message contextuel pour le chat selon profil
export function getPersonalizedChatTeaser(context: PersonalizedDashboardContext): string {
  const { profile, currentMood } = context;
  const name = profile.name || 'toi';
  
  const challenges = profile.challenges.slice(0, 2); // Max 2 pour le teaser
  const challengesText = challenges.length > 0 
    ? ` et tes défis ${challenges.map(id => ADHD_CHALLENGES[id]?.label).join(', ')}`
    : '';
  
  const teasers = {
    energetic: `Salut ${name} ! Vu ton mood ⚡${challengesText}, par quoi on commence ?`,
    normal: `Hey ${name} ! Comment je peux t'aider avec ton mood 😊${challengesText} ?`,
    tired: `Salut ${name}... Mood 😴${challengesText}, on fait quelque chose de doux ?`,
    stressed: `${name}, respire 💙 Avec ton stress${challengesText}, on décompresse ?`,
    sad: `${name} 💜 Jour difficile${challengesText} ? Je suis là pour toi.`
  };
  
  return teasers[currentMood] || teasers.normal;
}

// Analytics personnalisées selon profil
export function getPersonalizedAnalyticsInsights(profile: UserProfile): Array<{
  title: string;
  description: string;
  type: 'medication' | 'chronotype' | 'challenges' | 'mood';
  priority: number;
}> {
  const insights = [];
  
  // Insights médications
  if (profile.medications.length > 0) {
    insights.push({
      title: 'Corrélation humeur & médications',
      description: `Analyse l'impact de tes ${profile.medications.length} médication(s) sur ton humeur`,
      type: 'medication' as const,
      priority: 9
    });
  }
  
  // Insights chronotype
  if (profile.chronotype) {
    const chronotypeData = CHRONOTYPES[profile.chronotype];
    insights.push({
      title: 'Optimisation chronotype',
      description: `Tu es ${chronotypeData.label.toLowerCase()}, analyse ta productivité ${chronotypeData.peakHours.join('h-')}h`,
      type: 'chronotype' as const,
      priority: 8
    });
  }
  
  // Insights défis ADHD
  if (profile.challenges.length > 0) {
    const mainChallenge = ADHD_CHALLENGES[profile.challenges[0]];
    insights.push({
      title: `Progrès ${mainChallenge?.label}`,
      description: `Suivi de ton défi prioritaire "${mainChallenge?.description}"`,
      type: 'challenges' as const,
      priority: 10
    });
  }
  
  // Insight mood patterns
  insights.push({
    title: 'Patterns d\'humeur',
    description: 'Découvre tes tendances émotionnelles et déclencheurs',
    type: 'mood' as const,
    priority: 7
  });
  
  return insights.sort((a, b) => b.priority - a.priority);
}