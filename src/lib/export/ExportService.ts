import { ExportOptions, MedicalExportData, ExportProgress } from './types';
import { PDFGenerator } from './PDFGenerator';
import { DataProcessor } from './DataProcessor';
import { ShareService } from './ShareService';
import Papa from 'papaparse';

export class ExportService {
  private static instance: ExportService;
  private cache: Map<string, { data: Blob; timestamp: number }> = new Map();
  private progressCallbacks: Array<(progress: ExportProgress) => void> = [];

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  onProgress(callback: (progress: ExportProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress(step: string, percentage: number, message: string): void {
    const progress: ExportProgress = { step, percentage, message };
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  async exportData(options: ExportOptions): Promise<Blob> {
    const cacheKey = this.generateCacheKey(options);
    
    // Check cache (valide 30 minutes)
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      this.notifyProgress('cache', 100, 'Récupération depuis le cache...');
      return cached.data;
    }

    try {
      // Étape 1: Collecte des données
      this.notifyProgress('collect', 10, 'Collecte des données...');
      const dataProcessor = new DataProcessor();
      const exportData = await dataProcessor.processData(options);

      // Étape 2: Génération selon le format
      this.notifyProgress('generate', 50, 'Génération du document...');
      let result: Blob;

      switch (options.format) {
        case 'pdf':
          result = await this.generatePDF(exportData, options);
          break;
        case 'json':
          result = this.generateJSON(exportData);
          break;
        case 'csv':
          result = this.generateCSV(exportData);
          break;
        default:
          throw new Error(`Format non supporté: ${options.format}`);
      }

      // Étape 3: Compression et cache
      this.notifyProgress('finalize', 90, 'Finalisation...');
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      // Nettoyer le cache (garder max 10 items)
      if (this.cache.size > 10) {
        const oldest = Array.from(this.cache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        this.cache.delete(oldest[0]);
      }

      this.notifyProgress('complete', 100, 'Export terminé !');
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.notifyProgress('error', 0, 'Erreur lors de l\'export');
      throw error;
    }
  }

  private async generatePDF(data: MedicalExportData, options: ExportOptions): Promise<Blob> {
    const pdfGenerator = new PDFGenerator();
    return await pdfGenerator.generate(data, options);
  }

  private generateJSON(data: MedicalExportData): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private generateCSV(data: MedicalExportData): Blob {
    // Créer un CSV avec plusieurs feuilles simulées
    let csvContent = '';

    // Section Mood
    csvContent += '# DONNÉES HUMEUR\n';
    csvContent += 'Date,Humeur,Énergie,Concentration,Anxiété,Notes\n';
    data.mood.entries.forEach(entry => {
      csvContent += `${entry.date},${entry.mood},${entry.energy},${entry.focus},${entry.anxiety},"${entry.notes || ''}"\n`;
    });

    csvContent += '\n# MÉDICAMENTS\n';
    csvContent += 'Nom,Dosage,Fréquence,Adhérence,Notes\n';
    data.profile.medications.forEach(med => {
      csvContent += `"${med.name}","${med.dosage}","${med.frequency}",${med.adherence || ''},"${med.notes || ''}"\n`;
    });

    if (data.habits.sleep.length > 0) {
      csvContent += '\n# SOMMEIL\n';
      csvContent += 'Date,Coucher,Réveil,Qualité,Durée(h)\n';
      data.habits.sleep.forEach(sleep => {
        csvContent += `${sleep.date},${sleep.bedtime},${sleep.wakeup},${sleep.quality},${sleep.duration}\n`;
      });
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async shareExport(blob: Blob, options: ExportOptions): Promise<void> {
    const shareService = new ShareService();
    
    const filename = this.generateFilename(options);
    const file = new File([blob], filename, { type: blob.type });
    
    await shareService.shareFile(file, options);
  }

  async generateSecureLink(data: MedicalExportData): Promise<string> {
    // Générer un lien temporaire sécurisé (24h)
    const shareService = new ShareService();
    return await shareService.generateSecureLink(data);
  }

  private generateCacheKey(options: ExportOptions): string {
    return `export_${options.format}_${options.period.value}_${options.anonymize}_${Date.now() - (Date.now() % (5 * 60 * 1000))}`;
  }

  private generateFilename(options: ExportOptions): string {
    const date = new Date().toISOString().split('T')[0];
    const period = options.period.label.replace(/ /g, '');
    const prefix = options.anonymize ? 'Rapport-ADHD-Anonyme' : 'Rapport-ADHD';
    
    switch (options.format) {
      case 'pdf':
        return `${prefix}-${period}-${date}.pdf`;
      case 'json':
        return `${prefix}-${period}-${date}.json`;
      case 'csv':
        return `${prefix}-${period}-${date}.csv`;
      default:
        return `${prefix}-${period}-${date}`;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}