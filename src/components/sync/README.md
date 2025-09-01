# ADHD Life Assistant - Système de Synchronisation

## 🎯 Vue d'ensemble

Système de synchronisation bidirectionnelle intelligent avec Google Drive, conçu spécialement pour les utilisateurs ADHD avec une approche **offline-first** et des messages bienveillants.

## 🚀 Fonctionnalités principales

### ✅ Sync Engine
- **Queue persistante** : Les opérations sont sauvées et résistent aux fermetures d'app
- **Détection automatique** : Changements locaux et distants détectés intelligemment  
- **Upload automatique** : Toutes les 30s si connecté
- **Download périodique** : Check des changements distants toutes les 2min
- **Conflict resolution** : Interface utilisateur simple et bienveillante

### 🔄 Stratégie Offline-First
- **Fonctionnement hors-ligne** : Toutes les opérations CRUD marchent sans internet
- **Retry intelligent** : Backoff exponentiel (1s, 2s, 4s, 8s, 16s max)
- **Merge sans perte** : Aucune donnée n'est jamais perdue
- **Mode dégradé** : Fallback gracieux si Drive inaccessible

### 🎨 UI ADHD-Friendly
- **Indicateurs temps réel** : 🟢 synced / 🟡 syncing / 🔴 offline / ❌ error
- **Notifications discrètes** : Toast non-intrusifs avec messages positifs
- **Bouton sync rapide** : Accessible en un clic
- **Progress bars** : Avec pourcentages et animations apaisantes
- **Messages bienveillants** : "Pas de panique ! Tes données sont safe"

## 📦 Installation et utilisation

### 1. Wrapper l'app avec SyncProvider

```tsx
// src/app/layout.tsx
import { SyncProvider } from '@/components/sync';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SyncProvider enableAutoSync={true}>
          {children}
        </SyncProvider>
      </body>
    </html>
  );
}
```

### 2. Ajouter l'indicateur de statut

```tsx
// Dans votre header/navbar
import { SyncStatusIndicator } from '@/components/sync';

export function Header() {
  return (
    <header>
      <nav className="flex items-center justify-between">
        <div>Mon App ADHD</div>
        <SyncStatusIndicator />
      </nav>
    </header>
  );
}
```

### 3. Auto-sync d'un module

```tsx
// src/hooks/useHealthSync.ts
import { useAutoSync } from '@/components/sync';
import { useHealth } from '@/modules/health/HealthContext';

export function useHealthSync() {
  const { medications, symptoms } = useHealth();
  
  const { forceSync } = useAutoSync({
    module: 'health',
    data: { medications, symptoms },
    enabled: true,
    maxRetries: 3
  });

  return { forceSync };
}
```

### 4. Dashboard de sync (optionnel)

```tsx
// Page de paramètres
import { SyncDashboard } from '@/components/sync';

export function SettingsPage() {
  return (
    <div>
      <h1>Paramètres</h1>
      <SyncDashboard />
    </div>
  );
}
```

## 🔧 Configuration Google Drive

### Variables d'environnement

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
```

### Scopes requis
- `https://www.googleapis.com/auth/drive.appdata` : Pour appDataFolder
- `https://www.googleapis.com/auth/userinfo.email` : Info utilisateur
- `https://www.googleapis.com/auth/userinfo.profile` : Profil utilisateur

## 🎭 Exemples d'usage

### Sync manuelle
```tsx
import { useSyncManager } from '@/components/sync';

function MyComponent() {
  const syncManager = useSyncManager();
  
  const handleSyncNow = () => {
    syncManager.forceSync();
  };

  return <button onClick={handleSyncNow}>Sync maintenant</button>;
}
```

### Écouter les conflits
```tsx
import { useSyncStatus } from '@/components/sync';

function ConflictHandler() {
  const { conflicts, resolveConflict } = useSyncStatus();
  
  if (conflicts.length === 0) return null;
  
  return (
    <div>
      {conflicts.map(conflict => (
        <div key={conflict.id}>
          <p>Conflit détecté pour {conflict.module}</p>
          <button onClick={() => resolveConflict(conflict.id, true)}>
            Garder version locale
          </button>
          <button onClick={() => resolveConflict(conflict.id, false)}>
            Garder version cloud
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Mode avion
```tsx
import { AirplaneModeToggle } from '@/components/sync';

function Toolbar() {
  return (
    <div className="flex items-center space-x-4">
      <AirplaneModeToggle />
      {/* autres outils */}
    </div>
  );
}
```

## 🛠️ Architecture technique

### Structure des fichiers
```
src/
├── components/sync/
│   ├── SyncProvider.tsx          # Context provider principal
│   ├── SyncStatusIndicator.tsx   # Indicateur temps réel
│   ├── SyncProgressBar.tsx       # Barre de progression
│   ├── SyncToast.tsx            # Notifications toast
│   ├── SyncDashboard.tsx        # Dashboard complet
│   ├── ConflictResolutionModal.tsx # Modal de résolution
│   ├── AirplaneModeToggle.tsx   # Toggle mode avion
│   └── index.ts                 # Exports centralisés
├── hooks/
│   ├── useAutoSync.ts           # Auto-sync des modules
│   ├── useSyncStatus.ts         # Statut de sync
│   └── useProfileSync.ts        # Exemple d'intégration
└── lib/sync/
    ├── SyncManager.ts           # Manager principal
    ├── DriveService.ts          # Service Google Drive
    └── ErrorHandler.ts          # Gestion d'erreurs ADHD-friendly
```

### Flux de données
1. **Modification locale** → Auto-détection → Queue persistante
2. **Queue** → Upload automatique (30s) → Google Drive
3. **Google Drive** → Check périodique (2min) → Download si changements
4. **Conflits** → Interface de résolution → Merge intelligent

## 🎨 Messages ADHD-Friendly

### Notifications positives
- ✅ "Super ! Toutes tes données sont synchronisées !"
- 🔄 "Petit souci technique. Pas de panique, on réessaye !"
- 📱 "Mode hors-ligne. Tu peux continuer, tout sera sync plus tard !"

### Gestion des erreurs
- **Réseau** : "Pas de réseau ? Pas de problème ! Tes données sont safe."
- **Auth** : "Il faut se reconnecter à Google Drive. C'est juste de la sécurité !"
- **Quota** : "Ton Drive est un peu plein ! Pas de stress, tout fonctionne."

## 🔒 Sécurité et confidentialité

- **Données chiffrées** : Stockage sécurisé dans appDataFolder
- **Tokens sécurisés** : Refresh automatique des tokens
- **Logs anonymes** : Aucune donnée personnelle loggée
- **Isolation** : Chaque utilisateur a ses propres données

## 🚀 Performance

- **Cache intelligent** : Évite les uploads inutiles
- **Compression** : Données optimisées pour la bande passante
- **Nettoyage auto** : Garde seulement les 5 versions les plus récentes
- **Debounce** : Évite les sync trop fréquentes (2s de délai)

## 🎯 Prochaines améliorations

- [ ] Sync incrémentale (delta seulement)
- [ ] Compression GZIP des données
- [ ] Sync P2P entre appareils du même utilisateur
- [ ] Analytics de sync (anonymes)
- [ ] Support multi-compte Google
- [ ] Backup vers autres providers (Dropbox, OneDrive)