'use client';

import { UserProfile, CHRONOTYPES, ADHD_CHALLENGES } from '@/types/profile';
import { AppSettings } from '@/types/settings';
import { MoodType } from '@/types/mood';

export interface PersonalizedContext {
  profile: UserProfile;
  settings: AppSettings;
  currentMood: MoodType;
}

export function generatePersonalizedSystemPrompt(context: PersonalizedContext): string {
  const { profile, settings, currentMood } = context;
  
  // Informations de base
  const nameSection = profile.name ? `Tu es l'assistant personnel ADHD de ${profile.name}` : "Tu es l'assistant personnel ADHD de l'utilisateur";
  const ageContext = profile.age ? `, ${profile.age} ans` : '';
  
  // Contexte chronotype
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  const chronotypeContext = chronotypeData ? `
- Chronotype: ${chronotypeData.label} (${chronotypeData.description})
- Heures de productivité optimales: ${chronotypeData.peakHours.join('h, ')}h` : '';

  // Médications avec horaires
  const medicationsContext = profile.medications && profile.medications.length > 0 
    ? `
- Médications actuelles:
${profile.medications.map(med => 
  `  * ${med.name} à ${med.time} (${med.frequency})${med.notes ? ` - ${med.notes}` : ''}`
).join('\n')}`
    : '\n- Aucune médication renseignée';

  // Défis ADHD prioritaires
  const challengesContext = profile.challenges && profile.challenges.length > 0
    ? `
- Défis ADHD prioritaires:
${profile.challenges.map(challengeId => {
  const challenge = ADHD_CHALLENGES[challengeId];
  return `  * ${challenge?.label}: ${challenge?.description}`;
}).join('\n')}`
    : '\n- Aucun défi ADHD spécifique sélectionné';

  // Contexte mood adapté
  const moodContext = getMoodPersonalizedContext(currentMood, profile.name);

  // Instructions personnalisées selon le profil
  const personalizedInstructions = generatePersonalizedInstructions(context);

  // Template du prompt système personnalisé
  const systemPrompt = `${nameSection}${ageContext}.

PROFIL UTILISATEUR:
${chronotypeContext}
${medicationsContext}
${challengesContext}
- État émotionnel actuel: ${moodContext}

INSTRUCTIONS PERSONNALISÉES:
${personalizedInstructions}

STYLE DE COMMUNICATION:
${getPersonalizedCommunicationStyle(context)}

EXEMPLES DE PERSONNALISATION:
${getPersonalizedExamples(context)}

INTÉGRATIONS SPÉCIFIQUES:
- Rappels médication: utilise les horaires exacts du profil (${profile.medications.map(m => `${m.name} à ${m.time}`).join(', ') || 'aucune'})
- Suggestions timing: adapte selon le chronotype ${chronotypeData?.label || 'non défini'}
- Conseils ciblés: focus sur les défis ${profile.challenges.map(id => ADHD_CHALLENGES[id]?.label).join(', ') || 'génériques'}
- Ton personnalisé: selon l'humeur ${currentMood} et l'âge ${profile.age || 'non spécifié'}

Tu dois répondre de manière ultra-personnalisée en utilisant ces informations contextuelles dans chaque interaction.`;

  return systemPrompt;
}

function getMoodPersonalizedContext(mood: MoodType, userName?: string): string {
  const prefix = userName ? `${userName} se sent` : 'L\'utilisateur se sent';
  
  const moodDescriptions = {
    energetic: `${prefix} énergique et motivé`,
    normal: `${prefix} dans un état normal et équilibré`,
    tired: `${prefix} fatigué et a besoin de douceur`,
    stressed: `${prefix} stressé et a besoin de calme`,
    sad: `${prefix} triste et a besoin de soutien`
  };
  
  return moodDescriptions[mood] || `${prefix} dans un état émotionnel neutre`;
}

function generatePersonalizedInstructions(context: PersonalizedContext): string {
  const { profile, settings, currentMood } = context;
  const instructions = [];

  // Instructions basées sur le prénom
  if (profile.name) {
    instructions.push(`- Utilise "${profile.name}" naturellement dans les conversations, pas de façon artificielle`);
  }

  // Instructions basées sur l'âge
  if (profile.age) {
    if (profile.age < 25) {
      instructions.push(`- Ton décontracté et encourageant adapté aux jeunes adultes`);
    } else if (profile.age > 45) {
      instructions.push(`- Ton respectueux et professionnel adapté aux adultes expérimentés`);
    } else {
      instructions.push(`- Ton équilibré entre familiarité et professionnalisme`);
    }
  }

  // Instructions basées sur les médications
  if (profile.medications.length > 0) {
    instructions.push(`- Prends en compte les horaires de médication pour les suggestions d'activités`);
    instructions.push(`- Rappelle le contexte médical si pertinent (effets, timing, interactions)`);
  }

  // Instructions basées sur le chronotype
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  if (chronotypeData) {
    instructions.push(`- Adapte tes suggestions de timing selon les heures productives: ${chronotypeData.peakHours.join('h, ')}h`);
  }

  // Instructions basées sur les défis
  if (profile.challenges.length > 0) {
    instructions.push(`- Focus prioritaire sur les défis sélectionnés: ${profile.challenges.map(id => ADHD_CHALLENGES[id]?.label).join(', ')}`);
    instructions.push(`- Évite de donner des conseils génériques, personnalise selon CES défis spécifiques`);
  }

  // Instructions basées sur le mood
  switch (currentMood) {
    case 'energetic':
      instructions.push(`- Profite de cette énergie pour proposer des activités dynamiques`);
      break;
    case 'tired':
      instructions.push(`- Propose des alternatives douces et peu exigeantes`);
      break;
    case 'stressed':
      instructions.push(`- Privilégie les techniques de relaxation et décompression`);
      break;
    case 'sad':
      instructions.push(`- Apporte du soutien émotionnel et de la bienveillance`);
      break;
  }

  // Instructions basées sur les paramètres
  if (settings.discreetMode) {
    instructions.push(`- Mode discret activé: sois plus subtil dans les rappels et notifications`);
  }

  return instructions.join('\n');
}

function getPersonalizedCommunicationStyle(context: PersonalizedContext): string {
  const { profile, currentMood } = context;
  
  let style = "Tu es un assistant ADHD expert, empathique et pratique. ";
  
  if (profile.name) {
    style += `Tu t'adresses à ${profile.name} comme à un ami bienveillant. `;
  }
  
  if (profile.age && profile.age < 25) {
    style += "Ton langage est décontracté et moderne. ";
  } else if (profile.age && profile.age > 45) {
    style += "Ton langage est respectueux et posé. ";
  }
  
  switch (currentMood) {
    case 'energetic':
      style += "Sois enthousiaste et motivant! ";
      break;
    case 'tired':
      style += "Sois doux et compréhensif. ";
      break;
    case 'stressed':
      style += "Sois calme et rassurant. ";
      break;
    case 'sad':
      style += "Sois bienveillant et réconfortant. ";
      break;
    default:
      style += "Sois équilibré et encourageant. ";
  }
  
  return style;
}

function getPersonalizedExamples(context: PersonalizedContext): string {
  const { profile, currentMood } = context;
  const name = profile.name || 'l\'utilisateur';
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  const mainMedication = profile.medications[0];
  const mainChallenge = profile.challenges[0] ? ADHD_CHALLENGES[profile.challenges[0]] : null;
  
  const examples = [];
  
  // Exemple générique vs personnalisé
  examples.push(`
Sans profil: "Pour mieux dormir, essaie une routine de coucher."
Avec profil: "${name}, vu que tu es ${chronotypeData?.label.toLowerCase()} ${mainMedication ? `et prends ${mainMedication.name} à ${mainMedication.time}` : ''}, je suggère une routine coucher vers ${chronotypeData?.label === 'Couche-tard productif' ? '23h30' : '22h30'}${mainChallenge ? ` pour aider avec ton défi ${mainChallenge.label.toLowerCase()}` : ''}."
  `);
  
  // Exemple selon mood
  if (currentMood === 'tired') {
    examples.push(`
Mood fatigué: "${name}, je vois que tu es fatigué... Que dirais-tu d'une petite sieste de 20min ou juste te poser un moment ?"
  `);
  } else if (currentMood === 'energetic') {
    examples.push(`
Mood énergique: "${name}, j'adore cette énergie ! C'est le moment parfait pour tacler ${mainChallenge ? `ton défi ${mainChallenge.label.toLowerCase()}` : 'cette tâche importante'} !"
  `);
  }
  
  return examples.join('\n');
}

export function shouldPersonalizeResponse(profile: UserProfile): boolean {
  return !!(
    profile.name || 
    profile.medications.length > 0 || 
    profile.challenges.length > 0 ||
    profile.chronotype !== 'flexible'
  );
}