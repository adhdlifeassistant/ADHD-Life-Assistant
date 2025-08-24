# 🧠 ADHD Life Assistant

Une Progressive Web App (PWA) qui s'adapte à votre humeur et vous aide au quotidien, spécialement conçue pour les personnes ADHD.

## ✨ Fonctionnalités

### 🎯 Core Features
- **Sélecteur d'humeur** : Interface adaptative selon votre état émotionnel
- **Chat avec Claude** : Assistant IA qui s'adapte à votre humeur
- **Rappels médicaments** : Notifications intelligentes avec Service Worker
- **Cuisine adaptative** : Recettes qui correspondent à votre énergie
- **Checklists anti-oublis** : Listes prêtes pour éviter les oublis ADHD
- **Dashboard unifié** : Navigation centralisée et intuitive

### 📱 PWA Features
- **Installation native** : Installable comme une vraie app
- **Mode offline** : Fonctionne sans connexion internet
- **Notifications** : Rappels persistants via Service Worker
- **Responsive design** : Optimisé mobile/desktop/tablette
- **Performance** : Chargement ultra-rapide avec cache intelligent

## 🚀 Technologies

- **Next.js 15** avec App Router et Turbopack
- **React 19** avec TypeScript
- **Tailwind CSS 4** pour le styling
- **Anthropic Claude API** pour l'IA
- **Service Workers** pour PWA et notifications
- **Sharp** pour optimisation d'images

## 💻 Installation & Développement

```bash
# Clone le projet
git clone [votre-repo]
cd adhd-life-assistant

# Installe les dépendances
npm install

# Configure les variables d'environnement
cp .env.example .env.local
# Ajoute ta clé API Anthropic dans ANTHROPIC_API_KEY

# Lance le serveur de dev
npm run dev

# Build pour production
npm run build

# Génère les icônes PWA
npm run generate-icons
```

## 🏗️ Architecture

```
src/
├── app/                 # Next.js App Router
│   ├── api/chat/        # API Claude
│   ├── layout.tsx       # Layout principal avec PWA
│   └── page.tsx         # Page d'accueil
├── modules/             # Modules fonctionnels
│   ├── mood/            # Système d'humeur
│   ├── chat/            # Interface Claude
│   ├── reminders/       # Rappels médicaments
│   ├── cooking/         # Cuisine adaptative
│   ├── checklists/      # Anti-oublis
│   └── dashboard/       # Navigation unifiée
├── components/          # Composants partagés
├── lib/                 # Utilitaires et logique métier
├── types/               # Types TypeScript
└── styles/              # Styles globaux
```

## 🎨 Système d'humeur

L'app s'adapte complètement selon 5 humeurs :

- 😊 **Énergique** : Focus sur productivité et créativité
- 😐 **Normal** : Équilibre et vue d'ensemble
- 😴 **Fatigue** : Solutions simples et réconfortantes
- 😰 **Stress** : Apaisement et réduction de pression
- 😢 **Tristesse** : Bienveillance et support émotionnel

Chaque humeur change :
- Les couleurs et animations de l'interface
- Les modules recommandés et leur ordre
- Les messages et suggestions de Claude
- Les types de recettes proposées
- L'organisation des checklists

## 🔧 Configuration Vercel

```bash
# Déploie sur Vercel
npx vercel

# Configure les variables d'environnement :
# ANTHROPIC_API_KEY=ta_clé_anthropic
# NODE_ENV=production
```

## 📊 Performance

- **Lighthouse Score** : >90 sur tous les critères
- **Bundle size** : ~139kb First Load JS
- **Cache Strategy** : Network First avec fallback offline
- **Image optimization** : WebP/AVIF avec Sharp

## 🎯 Optimisations ADHD

- **Feedback visuel immédiat** pour toutes les actions
- **Navigation simplifiée** avec raccourcis PWA
- **Rappels non-intrusifs** mais persistants
- **Interface adaptative** selon l'état émotionnel
- **Checklists visuelles** pour éviter les oublis
- **Suggestions contextuelles** basées sur l'humeur

## 📱 Installation PWA

L'app propose automatiquement l'installation après 30 secondes d'utilisation. Une fois installée :

- Accès depuis l'écran d'accueil
- Fonctionnement offline
- Notifications natives
- Expérience native mobile

## 🔄 Scripts disponibles

```bash
npm run dev              # Développement avec Turbopack
npm run build           # Build production
npm run start           # Serveur production
npm run type-check      # Vérification TypeScript
npm run generate-icons  # Génération icônes PWA
npm run analyze         # Analyse du bundle
npm run lighthouse      # Audit performance
```

## 🤝 Contribution

Cette app est conçue spécifiquement pour la communauté ADHD. Les contributions sont les bienvenues pour :

- Améliorer l'accessibilité
- Ajouter de nouvelles stratégies d'adaptation
- Optimiser l'expérience utilisateur ADHD
- Corriger les bugs et améliorer les performances

## 📄 Licence

MIT - Fait avec 💜 pour la communauté ADHD

---

**Note** : Cette app nécessite une clé API Anthropic Claude pour fonctionner complètement. Le mode offline fonctionne pour l'interface mais pas pour le chat.
Test automatisation
