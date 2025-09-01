'use client';

import { useState, useEffect } from 'react';
import { ShareService } from '@/lib/export/ShareService';
import { MedicalExportData } from '@/lib/export/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalExportData;
}

export function QRCodeModal({ isOpen, onClose, data }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expirationTime, setExpirationTime] = useState<string>('');

  useEffect(() => {
    if (isOpen && data) {
      generateQRCode();
    }
  }, [isOpen, data]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      const shareService = new ShareService();
      
      // Générer le lien sécurisé
      const secureUrl = await shareService.generateSecureLink(data);
      setShareUrl(secureUrl);
      
      // Générer le QR code
      const qrCode = await shareService.generateQRCode(secureUrl);
      setQrCodeUrl(qrCode);
      
      // Calculer l'heure d'expiration
      const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setExpirationTime(expiration.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
      
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Afficher une notification de succès
      const button = document.getElementById('copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copié !';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Partage QR Code</h3>
          <p className="text-gray-600">Scannez ce code avec votre médecin pour partager vos données</p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Génération du QR code...</p>
          </div>
        ) : (
          <>
            {/* QR Code */}
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6 flex justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">QR Code indisponible</span>
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600">⏰</div>
                  <div className="text-sm text-yellow-700">
                    <strong>Expire le:</strong> {expirationTime}<br />
                    <strong>Utilisations max:</strong> 5 fois
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <div className="text-green-600">🔒</div>
                  <div className="text-sm text-green-700">
                    <strong>Sécurisé:</strong> Lien temporaire chiffré, données anonymisées selon vos paramètres
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600">📱</div>
                  <div className="text-sm text-blue-700">
                    <strong>Mode d'emploi:</strong> Votre médecin peut scanner ce code avec l'appareil photo de son téléphone ou utiliser une app de scan QR
                  </div>
                </div>
              </div>
            </div>

            {/* Lien de secours */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien de secours (si QR code ne fonctionne pas):
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  id="copy-button"
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Copier
                </button>
              </div>
            </div>

            {/* Instructions d'utilisation */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Comment ça marche ?</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Montrez ce QR code à votre médecin</li>
                <li>2. Il le scanne avec son téléphone</li>
                <li>3. Vos données s'affichent dans son navigateur</li>
                <li>4. Le lien expire automatiquement après 24h</li>
              </ol>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
          
          {shareUrl && (
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Imprimer QR
            </button>
          )}
        </div>

        {/* Message ADHD-friendly */}
        <div className="mt-4 text-center text-xs text-gray-500">
          🛡️ Vos données restent privées et ne sont stockées que temporairement
        </div>
      </div>
    </div>
  );
}