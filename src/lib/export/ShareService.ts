import QRCode from 'qrcode';
import { ExportOptions, MedicalExportData } from './types';

export class ShareService {
  private readonly TEMP_STORAGE_BASE_URL = 'https://api.adhd-helper.com/temp'; // À remplacer par votre API

  async shareFile(file: File, options: ExportOptions): Promise<void> {
    // Vérifier si l'API Web Share est disponible
    if (navigator.share && this.isMobileDevice()) {
      try {
        await navigator.share({
          files: [file],
          title: 'Rapport ADHD',
          text: `Rapport ADHD - ${options.period.label}`
        });
        return;
      } catch (error) {
        console.log('Web Share API failed, falling back to alternatives');
      }
    }

    // Fallback: afficher les options de partage
    this.showShareOptions(file, options);
  }

  async generateSecureLink(data: MedicalExportData): Promise<string> {
    try {
      // Générer un ID unique pour ce partage
      const shareId = this.generateShareId();
      
      // En production, cette API stockerait temporairement les données de façon sécurisée
      // Simulé ici avec localStorage pour la démo
      const tempData = {
        id: shareId,
        data,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
        views: 0,
        maxViews: 5
      };
      
      localStorage.setItem(`temp_share_${shareId}`, JSON.stringify(tempData));
      
      return `${this.TEMP_STORAGE_BASE_URL}/share/${shareId}`;
    } catch (error) {
      console.error('Erreur lors de la génération du lien sécurisé:', error);
      throw error;
    }
  }

  async generateQRCode(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw error;
    }
  }

  private showShareOptions(file: File, options: ExportOptions): void {
    // Créer une modal avec les options de partage
    this.createShareModal(file, options);
  }

  private createShareModal(file: File, options: ExportOptions): void {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    
    const fileUrl = URL.createObjectURL(file);
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="text-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2">Partager le rapport</h3>
          <p class="text-gray-600">Choisissez comment partager votre rapport ADHD</p>
        </div>
        
        <div class="space-y-3">
          ${this.getEmailButton(file)}
          ${this.getWhatsAppButton(file)}
          ${this.getDownloadButton(fileUrl, file.name)}
          ${this.getCopyLinkButton(fileUrl)}
        </div>
        
        <div class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div class="flex items-start space-x-2">
            <div class="text-yellow-600">⚠️</div>
            <div class="text-sm text-yellow-700">
              <strong>Confidentialité:</strong> Ce fichier contient vos données médicales personnelles. 
              Partagez-le uniquement avec des professionnels de santé de confiance.
            </div>
          </div>
        </div>
        
        <button 
          onclick="this.parentElement.parentElement.remove(); URL.revokeObjectURL('${fileUrl}')"
          class="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Fermer
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        URL.revokeObjectURL(fileUrl);
      }
    });
  }

  private getEmailButton(file: File): string {
    return `
      <button 
        onclick="this.shareViaEmail('${file.name}')"
        class="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <div class="text-2xl">📧</div>
        <div class="text-left">
          <div class="font-medium text-blue-800">Email</div>
          <div class="text-sm text-blue-600">Envoyer par email</div>
        </div>
      </button>
    `;
  }

  private getWhatsAppButton(file: File): string {
    if (!this.isMobileDevice()) return '';
    
    return `
      <button 
        onclick="this.shareViaWhatsApp('${file.name}')"
        class="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
      >
        <div class="text-2xl">📱</div>
        <div class="text-left">
          <div class="font-medium text-green-800">WhatsApp</div>
          <div class="text-sm text-green-600">Partager via WhatsApp</div>
        </div>
      </button>
    `;
  }

  private getDownloadButton(fileUrl: string, fileName: string): string {
    return `
      <a 
        href="${fileUrl}" 
        download="${fileName}"
        class="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
      >
        <div class="text-2xl">💾</div>
        <div class="text-left">
          <div class="font-medium text-purple-800">Télécharger</div>
          <div class="text-sm text-purple-600">Sauvegarder sur cet appareil</div>
        </div>
      </a>
    `;
  }

  private getCopyLinkButton(fileUrl: string): string {
    return `
      <button 
        onclick="navigator.clipboard.writeText('${fileUrl}').then(() => alert('Lien copié !'))"
        class="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div class="text-2xl">🔗</div>
        <div class="text-left">
          <div class="font-medium text-gray-800">Copier le lien</div>
          <div class="text-sm text-gray-600">Pour partage manuel</div>
        </div>
      </button>
    `;
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private generateShareId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Méthodes publiques pour intégration avec les boutons de partage
  shareViaEmail(fileName: string): void {
    const subject = encodeURIComponent('Rapport ADHD - Suivi médical');
    const body = encodeURIComponent(`
Bonjour,

Vous trouverez en pièce jointe mon rapport ADHD pour la période demandée.

Ce document contient :
- Mes données d'humeur et d'énergie
- Le suivi de mes médicaments 
- Mes habitudes de sommeil et d'activité
- Mes observations personnelles

Il a été généré automatiquement par mon application de suivi ADHD.

Cordialement
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  shareViaWhatsApp(fileName: string): void {
    const text = encodeURIComponent(`Voici mon rapport ADHD médical (${fileName}) pour notre consultation. Il contient mes données de suivi des dernières semaines.`);
    window.open(`https://wa.me/?text=${text}`);
  }

  // Méthodes pour la récupération de liens temporaires
  async retrieveSharedData(shareId: string): Promise<MedicalExportData | null> {
    try {
      const stored = localStorage.getItem(`temp_share_${shareId}`);
      if (!stored) return null;

      const tempData = JSON.parse(stored);
      
      // Vérifier l'expiration
      if (Date.now() > tempData.expiresAt) {
        localStorage.removeItem(`temp_share_${shareId}`);
        return null;
      }

      // Vérifier le nombre de vues
      if (tempData.views >= tempData.maxViews) {
        localStorage.removeItem(`temp_share_${shareId}`);
        return null;
      }

      // Incrémenter les vues
      tempData.views++;
      localStorage.setItem(`temp_share_${shareId}`, JSON.stringify(tempData));

      return tempData.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données partagées:', error);
      return null;
    }
  }

  cleanupExpiredShares(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('temp_share_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.expiresAt && now > data.expiresAt) {
            keysToRemove.push(key);
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}