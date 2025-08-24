import { ChecklistTemplate } from '@/types/checklists';

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'work-departure',
    name: 'Départ travail',
    emoji: '🏢',
    description: 'Tout ce dont tu as besoin pour une journée de travail',
    type: 'work',
    color: 'blue',
    estimatedTime: 5,
    items: [
      {
        id: 'medication',
        text: 'Médication matinale prise',
        emoji: '💊',
        isRequired: true,
        category: 'santé',
        tips: 'Essentiel pour ta concentration !'
      },
      {
        id: 'lunch',
        text: 'Déjeuner préparé ou argent resto',
        emoji: '🥪',
        isRequired: true,
        category: 'nourriture',
        tips: 'Évite les hypoglycémies de 12h !'
      },
      {
        id: 'laptop',
        text: 'Laptop + chargeur si besoin',
        emoji: '💻',
        isRequired: true,
        category: 'travail'
      },
      {
        id: 'keys-badge',
        text: 'Clés maison + badge bureau',
        emoji: '🔑',
        isRequired: true,
        category: 'accès'
      },
      {
        id: 'phone-accessories',
        text: 'Téléphone + écouteurs + powerbank',
        emoji: '📱',
        isRequired: false,
        category: 'tech'
      },
      {
        id: 'weather-clothes',
        text: 'Veste selon météo',
        emoji: '🌦️',
        isRequired: false,
        category: 'vêtements',
        tips: 'Regarde la météo !'
      },
      {
        id: 'water-bottle',
        text: 'Bouteille d\'eau',
        emoji: '💧',
        isRequired: false,
        category: 'santé',
        tips: 'Hydratation = concentration'
      },
      {
        id: 'agenda',
        text: 'Agenda/planning du jour vérifié',
        emoji: '📅',
        isRequired: false,
        category: 'organisation'
      }
    ]
  },

  {
    id: 'shopping-departure',
    name: 'Départ courses',
    emoji: '🛒',
    description: 'Pour ne rien oublier avant d\'aller faire les courses',
    type: 'shopping',
    color: 'green',
    estimatedTime: 3,
    items: [
      {
        id: 'payment',
        text: 'Carte bancaire + liquide backup',
        emoji: '💳',
        isRequired: true,
        category: 'paiement',
        tips: 'Toujours avoir un plan B !'
      },
      {
        id: 'bags',
        text: 'Sacs réutilisables',
        emoji: '🛍️',
        isRequired: true,
        category: 'transport',
        tips: 'Écologique et pratique !'
      },
      {
        id: 'shopping-list',
        text: 'Liste courses (papier ou app)',
        emoji: '📱',
        isRequired: true,
        category: 'organisation',
        tips: 'Anti-oubli et anti-achats impulsifs'
      },
      {
        id: 'keys',
        text: 'Clés maison/voiture',
        emoji: '🔑',
        isRequired: true,
        category: 'accès'
      },
      {
        id: 'mask',
        text: 'Masque si préférence',
        emoji: '😷',
        isRequired: false,
        category: 'santé'
      },
      {
        id: 'loyalty-cards',
        text: 'Cartes de fidélité',
        emoji: '🎫',
        isRequired: false,
        category: 'économies'
      }
    ]
  },

  {
    id: 'sport-departure',
    name: 'Départ sport',
    emoji: '🏃‍♀️',
    description: 'Équipement pour ta session de sport',
    type: 'sport',
    color: 'orange',
    estimatedTime: 4,
    items: [
      {
        id: 'sport-clothes',
        text: 'Tenue de sport complète',
        emoji: '👕',
        isRequired: true,
        category: 'vêtements'
      },
      {
        id: 'shoes',
        text: 'Chaussures de sport',
        emoji: '👟',
        isRequired: true,
        category: 'vêtements'
      },
      {
        id: 'water',
        text: 'Bouteille d\'eau remplie',
        emoji: '💧',
        isRequired: true,
        category: 'hydratation',
        tips: 'Hydratation = performance'
      },
      {
        id: 'towel',
        text: 'Serviette',
        emoji: '🤍',
        isRequired: true,
        category: 'hygiène'
      },
      {
        id: 'music',
        text: 'Écouteurs + playlist',
        emoji: '🎵',
        isRequired: false,
        category: 'motivation',
        tips: 'La musique booste la motivation !'
      },
      {
        id: 'membership',
        text: 'Carte d\'abonnement salle',
        emoji: '🎫',
        isRequired: false,
        category: 'accès'
      },
      {
        id: 'shower-kit',
        text: 'Kit douche si besoin',
        emoji: '🧴',
        isRequired: false,
        category: 'hygiène'
      }
    ]
  },

  {
    id: 'appointment-departure',
    name: 'Départ rendez-vous',
    emoji: '👥',
    description: 'Prêt(e) pour ton rendez-vous important',
    type: 'appointment',
    color: 'purple',
    estimatedTime: 4,
    items: [
      {
        id: 'address-time',
        text: 'Adresse + heure vérifiées',
        emoji: '📍',
        isRequired: true,
        category: 'logistique',
        tips: 'Double-check pour éviter le stress !'
      },
      {
        id: 'transport',
        text: 'Moyen de transport planifié',
        emoji: '🚗',
        isRequired: true,
        category: 'transport'
      },
      {
        id: 'documents',
        text: 'Documents nécessaires',
        emoji: '📄',
        isRequired: true,
        category: 'administratif'
      },
      {
        id: 'phone-contact',
        text: 'Téléphone + contact de la personne',
        emoji: '📱',
        isRequired: true,
        category: 'communication'
      },
      {
        id: 'appropriate-clothes',
        text: 'Tenue appropriée',
        emoji: '👔',
        isRequired: false,
        category: 'présentation'
      },
      {
        id: 'buffer-time',
        text: 'Marge de temps pour imprévus',
        emoji: '⏰',
        isRequired: false,
        category: 'planning',
        tips: '15min de marge minimum !'
      }
    ]
  },

  {
    id: 'travel-departure',
    name: 'Départ voyage',
    emoji: '✈️',
    description: 'Checklist pour partir en voyage sereinement',
    type: 'travel',
    color: 'indigo',
    estimatedTime: 10,
    items: [
      {
        id: 'documents',
        text: 'Papiers d\'identité + billets',
        emoji: '🎫',
        isRequired: true,
        category: 'administratif'
      },
      {
        id: 'medication-travel',
        text: 'Médication pour la durée + plus',
        emoji: '💊',
        isRequired: true,
        category: 'santé',
        tips: 'Toujours prévoir plus au cas où !'
      },
      {
        id: 'luggage',
        text: 'Valise/sac bouclé',
        emoji: '🧳',
        isRequired: true,
        category: 'bagages'
      },
      {
        id: 'chargers',
        text: 'Chargeurs téléphone/laptop',
        emoji: '🔌',
        isRequired: true,
        category: 'tech'
      },
      {
        id: 'house-security',
        text: 'Maison sécurisée (gaz/eau/électricité)',
        emoji: '🏠',
        isRequired: true,
        category: 'sécurité'
      },
      {
        id: 'emergency-contacts',
        text: 'Contacts d\'urgence notés',
        emoji: '🆘',
        isRequired: false,
        category: 'sécurité'
      },
      {
        id: 'insurance',
        text: 'Assurance voyage',
        emoji: '🛡️',
        isRequired: false,
        category: 'sécurité'
      },
      {
        id: 'entertainment',
        text: 'Livre/tablette pour transport',
        emoji: '📚',
        isRequired: false,
        category: 'confort'
      }
    ]
  }
];

export function getTemplateById(id: string): ChecklistTemplate | undefined {
  return CHECKLIST_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByType(type: string): ChecklistTemplate[] {
  return CHECKLIST_TEMPLATES.filter(template => template.type === type);
}