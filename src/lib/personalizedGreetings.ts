'use client';

import { UserProfile, CHRONOTYPES, ADHD_CHALLENGES } from '@/types/profile';
import { MoodType } from '@/types/mood';

export function getPersonalizedGreeting(profile: UserProfile, mood: MoodType): string {
  const name = profile.name || 'toi';
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  const currentHour = new Date().getHours();
  
  // Détermination du moment de la journée selon le chronotype
  let timeOfDay = '';
  if (profile.chronotype === 'morning' && currentHour < 12) {
    timeOfDay = ' ce matin';
  } else if (profile.chronotype === 'evening' && currentHour >= 17) {
    timeOfDay = ' ce soir';
  } else if (currentHour < 12) {
    timeOfDay = ' ce matin';
  } else if (currentHour < 17) {
    timeOfDay = ' cet après-midi';
  } else {
    timeOfDay = ' ce soir';
  }

  // Contexte médication si applicable
  let medicationContext = '';
  if (profile.medications.length > 0) {
    const nextMed = getNextMedication(profile.medications);
    if (nextMed) {
      medicationContext = ` N'oublie pas ton ${nextMed.name} ${nextMed.upcoming ? 'bientôt' : 'si ce n\'est pas déjà fait'}.`;
    }
  }

  // Messages personnalisés selon le mood
  const greetings = {
    energetic: [
      `Salut ${name} ! 🌟 Je sens une belle énergie${timeOfDay} !${medicationContext} Qu'est-ce qu'on va accomplir ensemble ?`,
      `Hey ${name} ! ⚡ Tu rayonnes${timeOfDay} ! ${profile.challenges.length > 0 ? `Parfait pour s'attaquer à tes défis ${profile.challenges.map(id => ADHD_CHALLENGES[id]?.label).slice(0,1)} !` : 'Que puis-je faire pour toi ?'}`,
      `${name} ! 🚀 Cette énergie${timeOfDay} est fantastique !${medicationContext} Prêt pour une session productive ?`
    ],
    
    normal: [
      `Salut ${name} !${timeOfDay.replace(' ce', ' Bon')} 😊${medicationContext} Comment ça va aujourd'hui ?`,
      `Hey ${name} ! ${chronotypeData ? `Vu que tu es ${chronotypeData.label.toLowerCase()}, c'est ${isOptimalTime(profile.chronotype, currentHour) ? 'le bon moment' : 'peut-être pas ton heure de pointe, mais on peut quand même bien bosser'} !` : 'Comment te sens-tu ?'}`,
      `Bonjour ${name} !${timeOfDay} ✨ Je suis là pour t'accompagner. Dis-moi ce dont tu as besoin.`
    ],
    
    tired: [
      `Salut ${name}... 😴 Je vois que c'est un peu dur${timeOfDay}.${medicationContext} Pas de pression, on y va à ton rythme.`,
      `Hey ${name} 💙 Fatigue${timeOfDay} ? ${profile.chronotype !== 'flexible' ? `Normal, c'est ${isOptimalTime(profile.chronotype, currentHour) ? 'pas' : ''} ton créneau habituel.` : ''} On peut prendre ça cool.`,
      `${name}, courage${timeOfDay} 🤗${medicationContext} Qu'est-ce qui t'aiderait le plus maintenant ?`
    ],
    
    stressed: [
      `Salut ${name} 💙 Je sens du stress${timeOfDay}...${medicationContext} Respire un coup, je suis là.`,
      `Hey ${name} 🫂 Ça semble tendu${timeOfDay}. ${profile.challenges.includes('emotional-regulation') ? 'Je sais que la gestion des émotions est un de tes défis, on va gérer ça ensemble.' : 'On va décompresser ensemble.'}`,
      `${name}, tout va bien se passer 🌸${medicationContext} Dis-moi ce qui te tracasse.`
    ],
    
    sad: [
      `Salut ${name} 💜${timeOfDay}... Je suis là pour toi.${medicationContext} Pas besoin d'être fort en permanence.`,
      `Hey ${name} 🤗 Jour difficile${timeOfDay} ? ${profile.challenges.includes('emotional-regulation') ? 'Les émotions sont complexes avec le ADHD, c\'est normal.' : 'C\'est ok de ne pas aller bien.'} Je t'écoute.`,
      `${name} 💙 Prends ton temps${timeOfDay}.${medicationContext} Tu veux en parler ou juste qu'on fasse quelque chose ensemble ?`
    ]
  };

  const moodGreetings = greetings[mood];
  const randomIndex = Math.floor(Math.random() * moodGreetings.length);
  return moodGreetings[randomIndex];
}

function getNextMedication(medications: UserProfile['medications']) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Trouve la prochaine médication dans les 2 heures
  for (const med of medications) {
    const medTime = med.time;
    const medHour = parseInt(medTime.split(':')[0]);
    const medMinute = parseInt(medTime.split(':')[1]);
    const medDate = new Date();
    medDate.setHours(medHour, medMinute, 0, 0);
    
    const timeDiff = medDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 0 && hoursDiff <= 2) {
      return { ...med, upcoming: true };
    }
  }
  
  // Si pas de médication dans les 2h, retourne la première de la journée
  return medications.length > 0 ? { ...medications[0], upcoming: false } : null;
}

function isOptimalTime(chronotype: UserProfile['chronotype'], currentHour: number): boolean {
  const optimal = CHRONOTYPES[chronotype]?.peakHours || [];
  return optimal.includes(currentHour);
}

export function getPersonalizedFallback(profile: UserProfile, mood: MoodType): string {
  const name = profile.name || 'toi';
  
  const fallbacks = {
    energetic: `${name}, petit souci technique mais ça ne nous arrêtera pas ! Qu'est-ce que tu voulais me dire ?`,
    normal: `Désolé ${name}, petit problème de connexion. Tu peux reformuler ?`,
    tired: `${name}... petit bug technique. Pas de stress, reprends quand tu peux.`,
    stressed: `${name}, oups... petit problème technique. Respire, on réessaye ?`,
    sad: `Pardon ${name}... problème technique. Je suis toujours là pour toi.`
  };
  
  return fallbacks[mood];
}