# ADHD Life Assistant - Export Médical Professionnel

## 🎯 Vue d'ensemble

Système d'export de données ADHD conçu pour le partage avec les professionnels de santé. Génère des rapports médicaux professionnels avec graphiques, anonymisation et partage sécurisé.

## ✨ Fonctionnalités principales

### 📄 **Formats d'export multiples**
- **PDF structuré** : Rapport médical professionnel avec graphiques (recommandé)
- **JSON complet** : Compatible avec apps médicales standardisées
- **CSV simple** : Pour analyse Excel/Google Sheets

### 📊 **Template PDF médical professionnel**
- **En-tête professionnel** : "Rapport ADHD" + période + logo discret
- **Page 1** : Résumé exécutif (profil, médications, tendances générales)
- **Graphiques visuels** : Courbes humeur/énergie, adhérence médicaments, patterns sommeil
- **Sections claires** : Profil, Historique mood, Médicaments, Habitudes, Observations
- **Footer** : Date génération + disclaimer "Document patient"

### 🔒 **Sécurité et confidentialité**
- **Anonymisation intelligente** : Prénom → initiales, masquage données sensibles
- **QR code temporaire** : Accès sécurisé 24h avec limite 5 vues
- **Partage sécurisé** : Email/WhatsApp/Drive avec PDF attaché
- **Cache local** : Export récent pour re-partage rapide

### ⚡ **Performance ADHD-friendly**
- **Génération instantanée** : Pas d'attente longue (< 2s)
- **Aperçu avant export** : Possibilité de modification
- **Progress indicators** : Feedback visuel en temps réel
- **Compression optimisée** : Max 2MB même avec 1 an de données

## 🚀 Installation et utilisation

### 1. Import des composants

```tsx
import { ShareWithDoctorButton, ExportModal } from '@/components/export';
```

### 2. Bouton simple dans header/menu

```tsx
// Dans votre header principal
export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <div>Mon App ADHD</div>
      <div className="flex items-center space-x-4">
        <ShareWithDoctorButton />
        {/* autres boutons */}
      </div>
    </header>
  );
}
```

### 3. Variantes du bouton

```tsx
// Bouton principal (recommandé)
<ShareWithDoctorButton variant="primary" size="lg" />

// Bouton secondaire
<ShareWithDoctorButton variant="secondary" size="md" />

// Bouton icône pour mobile
<ShareWithDoctorButton variant="icon" />
```

### 4. Export programmé

```tsx
import { ExportService, EXPORT_PERIODS } from '@/components/export';

export function CustomExport() {
  const handleExport = async () => {
    const exportService = ExportService.getInstance();
    
    const options = {
      period: EXPORT_PERIODS[1], // 1 mois
      format: 'pdf' as const,
      anonymize: true,
      includeGraphs: true,
      includeNotes: true,
      sections: [...DEFAULT_EXPORT_SECTIONS]
    };

    const blob = await exportService.exportData(options);
    
    // Télécharger
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport-adhd.pdf';
    a.click();
  };

  return <button onClick={handleExport}>Export custom</button>;
}
```

## 🎨 Exemples d'usage avancé

### Export avec callback de progression

```tsx
import { ExportService } from '@/components/export';

function ExportWithProgress() {
  const [progress, setProgress] = useState(0);
  
  const handleExport = async () => {
    const exportService = ExportService.getInstance();
    
    // Écouter la progression
    exportService.onProgress((progress) => {
      setProgress(progress.percentage);
      console.log(progress.message);
    });

    const options = { /* ... */ };
    const blob = await exportService.exportData(options);
  };

  return (
    <div>
      <button onClick={handleExport}>Exporter</button>
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

### QR Code pour partage rapide

```tsx
import { QRCodeModal, ShareService } from '@/components/export';

function QuickShare() {
  const [showQR, setShowQR] = useState(false);
  const [exportData, setExportData] = useState(null);

  const generateQRShare = async () => {
    // Récupérer les données utilisateur
    const dataProcessor = new DataProcessor();
    const data = await dataProcessor.processData({
      period: EXPORT_PERIODS[0], // 1 semaine
      format: 'json',
      anonymize: true,
      /* ... */
    });
    
    setExportData(data);
    setShowQR(true);
  };

  return (
    <>
      <button onClick={generateQRShare}>
        Partage QR rapide
      </button>
      
      {exportData && (
        <QRCodeModal 
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          data={exportData}
        />
      )}
    </>
  );
}
```

## 📋 Types et interfaces

### Configuration d'export

```tsx
interface ExportOptions {
  period: ExportPeriod;           // Période de données
  format: 'pdf' | 'json' | 'csv'; // Format de sortie
  anonymize: boolean;             // Anonymiser les données
  includeGraphs: boolean;         // Inclure graphiques (PDF)
  includeNotes: boolean;          // Inclure notes perso
  sections: ExportSection[];      // Sections à inclure
}

interface ExportPeriod {
  value: string;    // '1w', '1m', '3m', etc.
  label: string;    // '1 semaine', '1 mois', etc.
  days: number;     // Nombre de jours
}
```

### Données médicales

```tsx
interface MedicalExportData {
  metadata: {
    generatedAt: string;
    period: { start: string; end: string; days: number };
    patient: { name: string; age?: number; anonymized: boolean };
    version: string;
  };
  profile: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      adherence?: number;
      notes?: string;
    }>;
    challenges: string[];
    chronotype: string;
  };
  mood: {
    entries: Array<{ date: string; mood: number; energy: number; /* ... */ }>;
    averages: { mood: number; energy: number; focus: number; anxiety: number };
    trends: { mood: 'improving' | 'stable' | 'declining'; /* ... */ };
  };
  // ... autres sections
}
```

## 🛠️ Architecture technique

### Structure des fichiers
```
src/
├── components/export/
│   ├── ExportModal.tsx              # Interface principale d'export
│   ├── ShareWithDoctorButton.tsx    # Bouton déclencheur
│   ├── QRCodeModal.tsx             # Modal QR code
│   └── index.ts                    # Exports centralisés
├── lib/export/
│   ├── ExportService.ts            # Service principal
│   ├── DataProcessor.ts            # Traitement données
│   ├── PDFGenerator.ts             # Génération PDF + graphiques
│   ├── ShareService.ts             # Partage et QR codes
│   └── types.ts                    # Types TypeScript
```

### Dépendances utilisées
- **jsPDF** : Génération PDF
- **Chart.js** : Graphiques intégrés au PDF
- **QRCode** : Génération QR codes
- **Papa Parse** : Export CSV
- **date-fns** : Manipulation dates

## 🔧 Configuration

### Périodes disponibles par défaut
```tsx
export const EXPORT_PERIODS: ExportPeriod[] = [
  { value: '1w', label: '1 semaine', days: 7 },
  { value: '1m', label: '1 mois', days: 30 },
  { value: '3m', label: '3 mois', days: 90 },
  { value: '6m', label: '6 mois', days: 180 },
  { value: '1y', label: '1 an', days: 365 }
];
```

### Sections par défaut
```tsx
export const DEFAULT_EXPORT_SECTIONS: ExportSection[] = [
  { id: 'profile', name: 'Profil et médicaments', enabled: true },
  { id: 'mood', name: 'Humeur et émotions', enabled: true },
  { id: 'habits', name: 'Habitudes et routines', enabled: true },
  { id: 'observations', name: 'Observations personnelles', enabled: true },
  { id: 'graphs', name: 'Graphiques et tendances', enabled: true }
];
```

## 🎯 Bonnes pratiques

### 1. **Récupération des données**
```tsx
// ✅ Bon : Utiliser DataProcessor pour consistance
const dataProcessor = new DataProcessor();
const exportData = await dataProcessor.processData(options);

// ❌ Éviter : Accès direct localStorage
const rawData = localStorage.getItem('user-data');
```

### 2. **Gestion des erreurs**
```tsx
// ✅ Bon : Try-catch avec feedback utilisateur
try {
  const blob = await exportService.exportData(options);
  // Succès
} catch (error) {
  console.error('Export failed:', error);
  // Afficher message d'erreur ADHD-friendly
}
```

### 3. **Performance**
```tsx
// ✅ Bon : Utiliser le cache pour exports fréquents
const cachedBlob = exportService.getCachedExport(options);
if (cachedBlob) {
  return cachedBlob;
}

// ✅ Bon : Nettoyer les ressources
useEffect(() => {
  return () => {
    exportService.clearCache();
  };
}, []);
```

## 🚀 Prochaines améliorations

- [ ] Support multi-langues (EN, ES, DE)
- [ ] Templates PDF personnalisables
- [ ] Export vers Google Health, Apple Health
- [ ] Intégration calendriers médicaux
- [ ] Chiffrement end-to-end pour QR codes
- [ ] Analytics anonymes usage export
- [ ] Support tablettes avec aperçu étendu

## 🛡️ Sécurité

- **Données locales** : Traitées uniquement côté client
- **QR codes** : Expiration 24h + limite vues
- **Anonymisation** : Algorithmes respectueux RGPD
- **Partage** : Aucune donnée transitant par serveurs tiers
- **Cache** : Nettoyage automatique données temporaires

Le système est conçu pour respecter la vie privée des utilisateurs ADHD tout en facilitant le partage médical professionnel. 🎯