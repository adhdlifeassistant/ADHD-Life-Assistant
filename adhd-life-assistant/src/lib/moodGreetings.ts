import { MoodType } from '@/types/mood';

interface MoodGreetings {
  morning: string[];
  afternoon: string[];
  evening: string[];
  motivational: string[];
  supportive: string[];
}

const MOOD_GREETINGS: Record<MoodType, MoodGreetings> = {
  energetic: {
    morning: [
      "Salut champion ! 💪 Prêt(e) à conquérir cette journée ?",
      "Bonjour superstar ! ✨ Cette énergie est fantastique !",
      "Hello warrior ! 🚀 Tu rayonnes ce matin !",
      "Coucou dynamo ! ⚡ On sent cette motivation d'ici !"
    ],
    afternoon: [
      "Salut force de la nature ! 🌟 Tu gardes le rythme !",
      "Hey champion ! 💥 Cette énergie de l'après-midi est TOP !",
      "Hello machine ! 🔥 Tu es en feu aujourd'hui !",
      "Coucou tornado ! 🌪️ Rien ne t'arrête !"
    ],
    evening: [
      "Bonsoir rockstar ! 🎸 Quelle journée productive !",
      "Salut héros du jour ! 🦸‍♀️ Tu as tout déchiré !",
      "Hey champion ! 🏆 Time to celebrate cette énergie !",
      "Coucou wonder-person ! ⭐ Tu peux être fier(e) !"
    ],
    motivational: [
      "C'est LE moment pour tacler tes gros projets !",
      "Cette énergie est parfaite pour créer quelque chose d'amazing !",
      "Profite de cette vibe pour faire avancer tes rêves !",
      "Go go go ! L'univers t'envoie de la pure motivation !"
    ],
    supportive: [
      "N'oublie pas de prendre des pauses pour ne pas t'épuiser !",
      "Channel cette énergie intelligemment, tu es unstoppable !",
      "Hydrate-toi et nourris bien ce corps qui te porte si bien !",
      "Cette énergie est un cadeau, utilise-la avec sagesse !"
    ]
  },

  normal: {
    morning: [
      "Bonjour ! 😊 Belle journée qui commence tranquillement.",
      "Salut ! ☀️ Comment tu te sens ce matin ?",
      "Hello ! 🌸 Prêt(e) pour une journée équilibrée ?",
      "Coucou ! 🌱 On avance step by step aujourd'hui ?"
    ],
    afternoon: [
      "Salut ! 👋 Comment se passe ton après-midi ?",
      "Hello ! 🌿 Tu tiens le bon rythme !",
      "Coucou ! 😌 L'équilibre te va bien !",
      "Hey ! 🙂 Tranquille et efficace, j'adore !"
    ],
    evening: [
      "Bonsoir ! 🌙 Comment s'est passée ta journée ?",
      "Salut ! ✨ Time to relax après cette journée équilibrée.",
      "Hello ! 🌆 Tu peux être satisfait(e) de ta journée !",
      "Coucou ! 😊 Un bon bilan pour aujourd'hui ?"
    ],
    motivational: [
      "C'est parfait pour avancer sur tes projets régulièrement !",
      "Cette stabilité est idéale pour construire de bonnes habitudes.",
      "Profite de cet équilibre pour prendre soin de toi ET être productif/ve !",
      "La régularité est ta superpower aujourd'hui !"
    ],
    supportive: [
      "Tu es dans un bon flow, continue comme ça !",
      "Cette sérénité est précieuse, savoure-la !",
      "Parfait pour faire du progrès sans pression !",
      "Tu gères bien tes énergies, bravo !"
    ]
  },

  tired: {
    morning: [
      "Hey... 😴 Je vois que tu es fatigué(e). On y va doucement ?",
      "Salut sleepy... ☕ Pas de pression ce matin, ok ?",
      "Hello tired soul... 🛏️ Ton corps a besoin de tendresse.",
      "Coucou... 🌙 Difficile de démarrer ? C'est normal."
    ],
    afternoon: [
      "Salut... 😌 La fatigue de l'après-midi, je connais.",
      "Hey... ☕ Time for a break peut-être ?",
      "Hello... 🌸 Sois doux/douce avec toi aujourd'hui.",
      "Coucou... 🛋️ Un petit repos serait bienvenu ?"
    ],
    evening: [
      "Bonsoir tired friend... 🌜 Tu as fait ce que tu as pu.",
      "Salut... 😴 C'est ok d'être épuisé(e) le soir.",
      "Hello... 🌙 Time to recharge pour demain.",
      "Coucou... 💤 Tu mérites du repos maintenant."
    ],
    motivational: [
      "Les petites victoires comptent double quand on est fatigué(e) !",
      "Même fatigué(e), tu fais de ton mieux. C'est beau ça !",
      "Rest is productive too, remember ça !",
      "Ton corps et ton esprit ont le droit d'être fatigués."
    ],
    supportive: [
      "Hydrate-toi, mange quelque chose de bon, repose-toi.",
      "Pas besoin d'être productif/ve aujourd'hui, just survive.",
      "Listen to your body, il sait ce dont il a besoin.",
      "Tomorrow is another day, aujourd'hui on récupère."
    ]
  },

  stressed: {
    morning: [
      "Hey... 😰 Je sens du stress ce matin. Respirons ensemble ?",
      "Salut stressed friend... 🫁 Une chose à la fois, ok ?",
      "Hello... 💙 C'est tendu ? On va simplifier la journée.",
      "Coucou... 🌊 Breathe in, breathe out. Tu n'es pas seul(e)."
    ],
    afternoon: [
      "Salut... 😟 Le stress de l'après-midi monte ? Normal.",
      "Hey... 🌿 Pause respiration time, ça te dit ?",
      "Hello overwhelmed soul... 🤗 Step back, on décompresse.",
      "Coucou... ☁️ C'est beaucoup en ce moment ? Je comprends."
    ],
    evening: [
      "Bonsoir... 😔 Journée stressante ? Tu l'as survived !",
      "Salut tired warrior... 🌙 Le stress épuise, tu le sais.",
      "Hello brave person... ✨ Tu as tenu bon aujourd'hui.",
      "Coucou fighter... 💜 Time to let go du stress maintenant."
    ],
    motivational: [
      "Tu es plus fort(e) que tu ne le crois, même stressé(e) !",
      "Each breath is a small victory contre le stress.",
      "Tu gères des choses difficiles, acknowledge that !",
      "Stress means you care. Tu es quelqu'un de bien."
    ],
    supportive: [
      "Priority #1: respirer, boire de l'eau, manger.",
      "Dis-moi ce qui te stresse, sometimes talking helps.",
      "Tu n'as pas à tout gérer aujourd'hui, chose one thing.",
      "It's ok to not be ok. Le stress passera, promise."
    ]
  },

  sad: {
    morning: [
      "Courage... 💜 Je suis là pour toi. Qu'est-ce qui se passe ?",
      "Hey sweet soul... 🤗 Difficult morning ? Tu n'es pas seul(e).",
      "Hello brave heart... 💙 C'est dur parfois, je le sais.",
      "Salut... 🌸 Bad day ? We'll get through this together."
    ],
    afternoon: [
      "Hey... 💜 Still feeling down ? C'est ok, je reste.",
      "Salut tender heart... 🫂 Rough afternoon ? I see you.",
      "Hello... 💙 Tu fais de ton mieux, même si c'est hard.",
      "Coucou... 🌙 Pas besoin de sourire, just be yourself."
    ],
    evening: [
      "Bonsoir gentle soul... 🌜 Tu as survived today, bravo.",
      "Salut... 💜 Tough day ? Tu as quand même tenu.",
      "Hello strong person... ✨ Even sad, you're still fighting.",
      "Coucou warrior... 💙 Tomorrow might be easier, maybe."
    ],
    motivational: [
      "Tu es allowed to feel sad. C'est human, c'est normal.",
      "Même dans la tristesse, tu continues. C'est du courage ça.",
      "Your feelings sont valid, all of them, même les tough ones.",
      "Sad doesn't mean weak. Tu es courageux/se de ressentir."
    ],
    supportive: [
      "Tu veux me parler de ce qui te rend triste ?",
      "Sometimes we need to feel sad pour pouvoir heal.",
      "Take your time, no rush pour aller mieux.",
      "Je reste avec toi dans cette tristesse, tu n'es pas seul(e)."
    ]
  }
};

export function getPersonalizedGreeting(mood: MoodType): string {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay: 'morning' | 'afternoon' | 'evening';
  if (hour < 12) timeOfDay = 'morning';
  else if (hour < 18) timeOfDay = 'afternoon';
  else timeOfDay = 'evening';
  
  const greetings = MOOD_GREETINGS[mood][timeOfDay];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getMotivationalMessage(mood: MoodType): string {
  const messages = MOOD_GREETINGS[mood].motivational;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getSupportiveMessage(mood: MoodType): string {
  const messages = MOOD_GREETINGS[mood].supportive;
  return messages[Math.floor(Math.random() * messages.length)];
}