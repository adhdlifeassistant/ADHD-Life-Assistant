import { Recipe, Alternative, CookingMoodResponse, CookingMood } from '@/types/cooking';

export const RECIPES: Recipe[] = [
  // RECETTES ÉNERGIQUE
  {
    id: 'risotto-mushroom',
    name: 'Risotto aux champignons',
    description: 'Crémeux et réconfortant, parfait quand on a envie de cuisiner',
    emoji: '🍄',
    difficulty: 'medium',
    cookingTime: 35,
    prepTime: 15,
    servings: 4,
    ingredients: [
      { id: '1', name: 'Riz arborio', quantity: '300', unit: 'g' },
      { id: '2', name: 'Champignons de Paris', quantity: '500', unit: 'g' },
      { id: '3', name: 'Bouillon de légumes', quantity: '1', unit: 'L' },
      { id: '4', name: 'Parmesan râpé', quantity: '100', unit: 'g' },
      { id: '5', name: 'Vin blanc sec', quantity: '150', unit: 'ml' },
      { id: '6', name: 'Oignon', quantity: '1' },
      { id: '7', name: 'Ail', quantity: '2', unit: 'gousses' }
    ],
    steps: [
      { id: '1', instruction: 'Émincez l\'oignon et l\'ail, coupez les champignons en lamelles', duration: 10 },
      { id: '2', instruction: 'Faites chauffer le bouillon dans une casserole', duration: 5 },
      { id: '3', instruction: 'Dans une grande poêle, faites revenir l\'oignon jusqu\'à transparence', duration: 5 },
      { id: '4', instruction: 'Ajoutez le riz et mélangez 2 minutes jusqu\'à nacrage', duration: 2 },
      { id: '5', instruction: 'Versez le vin blanc et laissez évaporer', duration: 3 },
      { id: '6', instruction: 'Ajoutez le bouillon louche par louche en mélangeant', duration: 20, tips: 'Patience, c\'est le secret du risotto !' },
      { id: '7', instruction: 'Incorporez champignons et parmesan, assaisonnez', duration: 5 }
    ],
    tags: ['italien', 'végétarien', 'réconfortant'],
    moodCompatibility: ['energetic', 'normal'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: true,
    isBatchCookable: true,
    energy: 'medium'
  },

  {
    id: 'wok-vegetables',
    name: 'Wok de légumes sautés',
    description: 'Coloré et dynamique, idéal pour canaliser ton énergie !',
    emoji: '🥢',
    difficulty: 'easy',
    cookingTime: 15,
    prepTime: 20,
    servings: 2,
    ingredients: [
      { id: '1', name: 'Mélange de légumes surgelés', quantity: '400', unit: 'g' },
      { id: '2', name: 'Sauce soja', quantity: '3', unit: 'c. à soupe' },
      { id: '3', name: 'Huile de sésame', quantity: '2', unit: 'c. à soupe' },
      { id: '4', name: 'Gingembre frais', quantity: '2', unit: 'cm' },
      { id: '5', name: 'Ail', quantity: '2', unit: 'gousses' },
      { id: '6', name: 'Riz basmati', quantity: '200', unit: 'g', isOptional: true }
    ],
    steps: [
      { id: '1', instruction: 'Hachez ail et gingembre finement', duration: 5 },
      { id: '2', instruction: 'Faites chauffer l\'huile dans le wok à feu vif', duration: 2 },
      { id: '3', instruction: 'Ajoutez ail et gingembre, faites sauter 30 secondes', duration: 1 },
      { id: '4', instruction: 'Jetez les légumes, sautez 8-10 minutes en remuant', duration: 10 },
      { id: '5', instruction: 'Ajoutez sauce soja, mélangez et servez', duration: 2 }
    ],
    tags: ['asiatique', 'végétarien', 'rapide'],
    moodCompatibility: ['energetic', 'normal'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: false,
    isBatchCookable: true,
    energy: 'high'
  },

  // RECETTES FATIGUÉ
  {
    id: 'pasta-simple',
    name: 'Pâtes sauce tomate basilic',
    description: 'Le réconfort en 10 minutes, rien de plus simple',
    emoji: '🍝',
    difficulty: 'easy',
    cookingTime: 10,
    prepTime: 5,
    servings: 2,
    ingredients: [
      { id: '1', name: 'Pâtes (spaghetti ou penne)', quantity: '250', unit: 'g' },
      { id: '2', name: 'Sauce tomate en bocal', quantity: '400', unit: 'g' },
      { id: '3', name: 'Parmesan râpé', quantity: '50', unit: 'g' },
      { id: '4', name: 'Basilic séché', quantity: '1', unit: 'c. à thé' },
      { id: '5', name: 'Huile d\'olive', quantity: '2', unit: 'c. à soupe' }
    ],
    steps: [
      { id: '1', instruction: 'Mettez l\'eau des pâtes à bouillir avec du sel', duration: 5 },
      { id: '2', instruction: 'Cuisez les pâtes selon les instructions du paquet', duration: 8 },
      { id: '3', instruction: 'Pendant ce temps, réchauffez la sauce avec basilic', duration: 5 },
      { id: '4', instruction: 'Égouttez les pâtes, mélangez avec sauce et parmesan', duration: 2 }
    ],
    tags: ['italien', 'réconfortant', 'facile'],
    moodCompatibility: ['tired', 'normal', 'stressed'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: true,
    isBatchCookable: false,
    energy: 'low'
  },

  {
    id: 'grilled-cheese',
    name: 'Croque-monsieur express',
    description: 'Réconfortant et chaud, parfait pour les soirs difficiles',
    emoji: '🥪',
    difficulty: 'easy',
    cookingTime: 8,
    prepTime: 5,
    servings: 1,
    ingredients: [
      { id: '1', name: 'Pain de mie', quantity: '2', unit: 'tranches' },
      { id: '2', name: 'Jambon', quantity: '2', unit: 'tranches' },
      { id: '3', name: 'Fromage râpé', quantity: '50', unit: 'g' },
      { id: '4', name: 'Beurre', quantity: '1', unit: 'noix' }
    ],
    steps: [
      { id: '1', instruction: 'Tartinez le pain de beurre d\'un côté', duration: 2 },
      { id: '2', instruction: 'Garnissez: jambon et fromage entre les tranches', duration: 2 },
      { id: '3', instruction: 'Faites dorer 3-4 min de chaque côté à la poêle', duration: 8 }
    ],
    tags: ['rapide', 'réconfortant', 'enfance'],
    moodCompatibility: ['tired', 'sad', 'stressed'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: true,
    isBatchCookable: false,
    energy: 'low'
  },

  // RECETTES STRESSÉ
  {
    id: 'soup-comfort',
    name: 'Soupe veloutée carottes-gingembre',
    description: 'Apaisante à préparer et réconfortante à déguster',
    emoji: '🍲',
    difficulty: 'easy',
    cookingTime: 25,
    prepTime: 10,
    servings: 4,
    ingredients: [
      { id: '1', name: 'Carottes', quantity: '600', unit: 'g' },
      { id: '2', name: 'Pommes de terre', quantity: '2' },
      { id: '3', name: 'Oignon', quantity: '1' },
      { id: '4', name: 'Gingembre frais', quantity: '3', unit: 'cm' },
      { id: '5', name: 'Bouillon de légumes', quantity: '1', unit: 'L' },
      { id: '6', name: 'Crème fraîche', quantity: '100', unit: 'ml', isOptional: true }
    ],
    steps: [
      { id: '1', instruction: 'Épluchez et coupez légumes en morceaux (méditation)', duration: 10, tips: 'Prenez votre temps, c\'est relaxant' },
      { id: '2', instruction: 'Faites revenir l\'oignon dans un peu d\'huile', duration: 5 },
      { id: '3', instruction: 'Ajoutez légumes et gingembre, couvrez de bouillon', duration: 3 },
      { id: '4', instruction: 'Laissez mijoter 20 min jusqu\'à tendreté', duration: 20, tips: 'Profitez de l\'odeur qui embaume' },
      { id: '5', instruction: 'Mixez, ajoutez la crème, assaisonnez', duration: 5 }
    ],
    tags: ['végétarien', 'réconfortant', 'healthy'],
    moodCompatibility: ['stressed', 'sad', 'normal'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: true,
    isBatchCookable: true,
    energy: 'low'
  },

  // RECETTES NORMAL
  {
    id: 'chicken-rice',
    name: 'Poulet sauté riz sauté',
    description: 'Équilibré et savoureux, parfait pour une journée normale',
    emoji: '🍚',
    difficulty: 'medium',
    cookingTime: 20,
    prepTime: 15,
    servings: 3,
    ingredients: [
      { id: '1', name: 'Blanc de poulet', quantity: '400', unit: 'g' },
      { id: '2', name: 'Riz basmati cuit', quantity: '300', unit: 'g' },
      { id: '3', name: 'Petits pois surgelés', quantity: '100', unit: 'g' },
      { id: '4', name: 'Œufs', quantity: '2' },
      { id: '5', name: 'Sauce soja', quantity: '3', unit: 'c. à soupe' },
      { id: '6', name: 'Huile végétale', quantity: '2', unit: 'c. à soupe' }
    ],
    steps: [
      { id: '1', instruction: 'Découpez le poulet en lamelles', duration: 5 },
      { id: '2', instruction: 'Faites cuire le poulet à la poêle jusqu\'à doré', duration: 8 },
      { id: '3', instruction: 'Battez les œufs et faites-les brouiller', duration: 3 },
      { id: '4', instruction: 'Ajoutez riz, petits pois et sauce soja', duration: 5 },
      { id: '5', instruction: 'Mélangez tout ensemble 2 minutes', duration: 2 }
    ],
    tags: ['protéiné', 'équilibré', 'asiatique'],
    moodCompatibility: ['normal', 'energetic'],
    mealTypes: ['dinner', 'lunch'],
    isComfort: false,
    isBatchCookable: true,
    energy: 'medium'
  }
];

export const ALTERNATIVES: Alternative[] = [
  {
    id: 'delivery-comfort',
    type: 'delivery',
    name: 'Commande ton plat réconfort',
    description: 'C\'est ok de ne pas cuisiner, tu as le droit !',
    emoji: '🛵',
    estimatedTime: 30,
    mood: ['tired', 'sad', 'stressed', 'not-feeling-it']
  },
  {
    id: 'prepared-meal',
    type: 'prepared',
    name: 'Plat préparé du frigo',
    description: 'Une solution rapide et sans effort',
    emoji: '📦',
    estimatedTime: 5,
    mood: ['tired', 'not-feeling-it']
  },
  {
    id: 'snack-dinner',
    type: 'snack',
    name: 'Plateau apéro dînatoire',
    description: 'Fromage, pain, fruits... parfois c\'est parfait !',
    emoji: '🧀',
    estimatedTime: 10,
    mood: ['tired', 'sad', 'not-feeling-it']
  },
  {
    id: 'takeout-fresh',
    type: 'takeout',
    name: 'Salade / sandwich frais',
    description: 'Va chercher quelque chose de frais et bon',
    emoji: '🥗',
    estimatedTime: 15,
    mood: ['normal', 'energetic']
  }
];

const COOKING_MOOD_RESPONSES: Record<CookingMood, CookingMoodResponse> = {
  energetic: {
    greeting: "Tu es en forme ! 💪 Envie de cuisiner quelque chose de sympa ?",
    suggestion: "C'est le moment parfait pour tester une nouvelle recette ou faire du batch cooking !",
    recipes: RECIPES.filter(r => r.moodCompatibility.includes('energetic')),
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('energetic'))
  },
  normal: {
    greeting: "Comment tu te sens pour cuisiner ce soir ? 😊",
    suggestion: "Une cuisine équilibrée qui fait du bien sans se prendre la tête.",
    recipes: RECIPES.filter(r => r.moodCompatibility.includes('normal')),
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('normal'))
  },
  tired: {
    greeting: "Mode douceur cuisine activé 💙",
    suggestion: "Des solutions simples et réconfortantes, pas de pression !",
    recipes: RECIPES.filter(r => r.moodCompatibility.includes('tired')),
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('tired'))
  },
  stressed: {
    greeting: "Cuisine apaisante pour se détendre 🌿",
    suggestion: "Des préparations méditatives et des plats familiers qui sentent bon.",
    recipes: RECIPES.filter(r => r.moodCompatibility.includes('stressed')),
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('stressed'))
  },
  sad: {
    greeting: "Petit cocon cuisine pour prendre soin de toi 💜",
    suggestion: "Des plats doudou qui réchauffent le cœur, sans effort.",
    recipes: RECIPES.filter(r => r.moodCompatibility.includes('sad')),
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('sad'))
  },
  'not-feeling-it': {
    greeting: "Pas envie du tout ? C'est ok ! 🤗",
    suggestion: "Zéro culpabilité, voici des alternatives sans effort.",
    recipes: [],
    alternatives: ALTERNATIVES.filter(a => a.mood.includes('not-feeling-it'))
  }
};

export function getCookingMoodResponse(mood: CookingMood): CookingMoodResponse {
  return COOKING_MOOD_RESPONSES[mood];
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find(recipe => recipe.id === id);
}