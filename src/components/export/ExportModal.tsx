'use client';

import { useState } from 'react';
import { ExportOptions, EXPORT_PERIODS, DEFAULT_EXPORT_SECTIONS, ExportProgress } from '@/lib/export/types';
import { ExportService } from '@/lib/export/ExportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    period: EXPORT_PERIODS[1], // 1 mois par défaut
    format: 'pdf',
    anonymize: false,
    includeGraphs: true,
    includeNotes: true,
    sections: [...DEFAULT_EXPORT_SECTIONS]
  });

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const exportService = ExportService.getInstance();

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setProgress({ step: 'init', percentage: 0, message: 'Initialisation...' });

    try {
      // Écouter les updates de progression
      exportService.onProgress((progress) => {
        setProgress(progress);
      });

      const blob = await exportService.exportData(options);
      
      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Fermer la modal après succès
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setProgress({ 
        step: 'error', 
        percentage: 0, 
        message: 'Erreur lors de l\'export. Réessayez.' 
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
      }, 2000);
    }
  };

  const handleShare = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      const blob = await exportService.exportData(options);
      await exportService.shareExport(blob, options);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilename = () => {
    const date = new Date().toISOString().split('T')[0];
    const period = options.period.label.replace(/ /g, '');
    const prefix = options.anonymize ? 'Rapport-ADHD-Anonyme' : 'Rapport-ADHD';
    const extension = options.format.toUpperCase();
    
    return `${prefix}-${period}-${date}.${options.format}`;
  };

  const updateSection = (sectionId: string, enabled: boolean) => {
    setOptions(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, enabled } : section
      )
    }));
  };

  const getProgressColor = () => {
    if (!progress) return 'bg-blue-500';
    if (progress.step === 'error') return 'bg-red-500';
    if (progress.step === 'complete') return 'bg-green-500';
    return 'bg-blue-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Partager avec médecin</h2>
              <p className="text-gray-600">Exportez vos données ADHD dans un format professionnel</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* Preview Mode Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span>👁️</span>
              <span>Aperçu avant export</span>
            </button>
          </div>

          {!showPreview ? (
            // Configuration
            <div className="space-y-6">
              {/* Période */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Période d'observation</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {EXPORT_PERIODS.map(period => (
                    <button
                      key={period.value}
                      onClick={() => setOptions(prev => ({ ...prev, period }))}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        options.period.value === period.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Format d'export</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, format: 'pdf' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      options.format === 'pdf'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-medium">PDF Médical</div>
                    <div className="text-sm opacity-75">Recommandé</div>
                  </button>
                  
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, format: 'json' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      options.format === 'json'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💾</div>
                    <div className="font-medium">JSON</div>
                    <div className="text-sm opacity-75">Apps médicales</div>
                  </button>
                  
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, format: 'csv' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      options.format === 'csv'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium">CSV</div>
                    <div className="text-sm opacity-75">Excel/Sheets</div>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.anonymize}
                      onChange={(e) => setOptions(prev => ({ ...prev, anonymize: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-800">Anonymiser les données personnelles</div>
                      <div className="text-sm text-gray-600">Remplace le prénom par des initiales</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeGraphs}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeGraphs: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={options.format !== 'pdf'}
                    />
                    <div>
                      <div className="font-medium text-gray-800">Inclure les graphiques</div>
                      <div className="text-sm text-gray-600">Courbes de tendances visuelles (PDF uniquement)</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeNotes}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-800">Inclure les notes personnelles</div>
                      <div className="text-sm text-gray-600">Vos observations et commentaires</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sections */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Sections à inclure</h3>
                <div className="space-y-2">
                  {options.sections.map(section => (
                    <label key={section.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => updateSection(section.id, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="font-medium text-gray-800">{section.name}</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Preview
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Aperçu du rapport</h3>
              
              <div className="bg-white p-4 rounded border shadow-sm">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800">RAPPORT ADHD - SUIVI MÉDICAL</h4>
                  <p className="text-gray-600">Période: {options.period.label}</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Patient:</strong> {options.anonymize ? 'J. D***' : 'John Doe'}
                  </div>
                  
                  {options.sections.filter(s => s.enabled).map(section => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>{section.name}</span>
                    </div>
                  ))}
                  
                  {options.includeGraphs && options.format === 'pdf' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📊</span>
                      <span>Graphiques et tendances</span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t text-xs text-gray-500">
                    Format: {options.format.toUpperCase()} • 
                    Taille estimée: {options.format === 'pdf' ? '~500KB' : options.format === 'json' ? '~50KB' : '~30KB'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowPreview(false)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Retour aux options
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {progress && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                <span className="text-sm text-gray-500">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Export en cours...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Télécharger ({getFilename()})</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <span>📤</span>
              <span>Partager directement</span>
            </button>
          </div>

          {/* Info ADHD-friendly */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600">💡</div>
              <div className="text-sm text-blue-700">
                <strong>Astuce:</strong> Le format PDF est recommandé pour les médecins car il contient 
                des graphiques visuels et un formatage professionnel. Vos données restent 100% privées 
                et ne sont partagées qu'avec qui vous choisissez.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}