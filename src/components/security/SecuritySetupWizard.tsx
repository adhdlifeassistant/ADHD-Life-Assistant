'use client';

import { useState, useEffect } from 'react';
import { EncryptionService } from '@/lib/security/EncryptionService';
import { BiometricService } from '@/lib/security/BiometricService';
import { GDPRService } from '@/lib/security/GDPRService';

interface SecuritySetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

type Step = 'welcome' | 'password' | 'biometric' | 'gdpr' | 'complete';

export function SecuritySetupWizard({ isOpen, onComplete, onClose }: SecuritySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const encryptionService = EncryptionService.getInstance();
  const biometricService = BiometricService.getInstance();
  const gdprService = GDPRService.getInstance();

  useEffect(() => {
    if (isOpen) {
      checkBiometricAvailability();
      gdprService.initializeConsents();
    }
  }, [isOpen]);

  const checkBiometricAvailability = async () => {
    try {
      const capabilities = await biometricService.checkCapabilities();
      setBiometricAvailable(capabilities.available);
    } catch (error) {
      console.warn('Erreur biométrie:', error);
    }
  };

  const handlePasswordChange = (password: string) => {
    setMasterPassword(password);
    setPasswordScore(encryptionService.assessPasswordStrength(password));
    setError('');
  };

  const getPasswordStrengthColor = () => {
    if (passwordScore >= 80) return 'bg-green-500';
    if (passwordScore >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordScore >= 80) return 'Excellent';
    if (passwordScore >= 60) return 'Bon';
    return 'Trop faible';
  };

  const handleStepComplete = async () => {
    setIsProcessing(true);
    setError('');

    try {
      switch (currentStep) {
        case 'welcome':
          setCurrentStep('password');
          break;

        case 'password':
          if (masterPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
          }
          if (passwordScore < 60) {
            setError('Le mot de passe doit être plus fort');
            return;
          }
          
          await encryptionService.setupMasterPassword(masterPassword);
          setCurrentStep('biometric');
          break;

        case 'biometric':
          if (enableBiometric && biometricAvailable) {
            try {
              await biometricService.enrollBiometric('Empreinte principale');
            } catch (error) {
              console.warn('Échec biométrie:', error);
            }
          }
          setCurrentStep('gdpr');
          break;

        case 'gdpr':
          setCurrentStep('complete');
          break;

        case 'complete':
          onComplete();
          break;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Sécurisons vos données ADHD
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              En 3 étapes simples, nous allons protéger vos données médicales avec 
              un chiffrement de niveau militaire. Pas de panique, c'est plus simple que ça en a l'air !
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600">🔒</div>
                <div className="text-sm text-blue-700 text-left">
                  <strong>Pourquoi c'est important :</strong><br />
                  Vos données d'humeur, médicaments et habitudes sont ultra-sensibles. 
                  On les chiffre pour qu'elles restent 100% privées, même si votre appareil 
                  tombe entre de mauvaises mains.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div>3 étapes max</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🧠</div>
                <div>ADHD-friendly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🏆</div>
                <div>Niveau militaire</div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔑</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Créez votre mot de passe maître
              </h2>
              <p className="text-gray-600">
                Ce sera la seule clé pour déverrouiller toutes vos données. 
                Choisissez quelque chose de fort mais que vous retiendrez !
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe maître
                </label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 8 caractères avec chiffres et majuscules"
                />
                
                {masterPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Force du mot de passe:</span>
                      <span className={passwordScore >= 60 ? 'text-green-600' : 'text-red-600'}>
                        {getPasswordStrengthText()} ({passwordScore}/100)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmez le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Retapez votre mot de passe"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600">💡</div>
                  <div className="text-sm text-yellow-700">
                    <strong>Astuce ADHD :</strong> Utilisez une phrase que vous aimez + des chiffres. 
                    Ex: "JaimeLes🍕Pizza2024!" (19 caractères, ultra-fort)
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'biometric':
        return (
          <div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👆</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Connexion biométrique (optionnel)
              </h2>
              <p className="text-gray-600">
                Pour vous connecter super rapidement sans retaper votre mot de passe !
              </p>
            </div>

            {biometricAvailable ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-green-600">✅</div>
                    <div>
                      <div className="font-medium text-green-800">
                        {biometricService.getBiometricHelpMessage()}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Votre appareil supporte l'authentification biométrique
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={enableBiometric}
                    onChange={(e) => setEnableBiometric(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      Activer la connexion biométrique
                    </div>
                    <div className="text-sm text-gray-600">
                      Plus rapide et plus sécurisé que le mot de passe seul
                    </div>
                  </div>
                </label>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600">🔒</div>
                    <div className="text-sm text-blue-700">
                      <strong>Sécurité :</strong> Vos empreintes restent sur votre appareil. 
                      Elles ne sont jamais envoyées sur internet.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-3">📱</div>
                  <div className="font-medium text-gray-700 mb-2">
                    Authentification biométrique non disponible
                  </div>
                  <div className="text-sm text-gray-600">
                    Pas de souci ! Vous pourrez toujours vous connecter avec votre mot de passe.
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'gdpr':
        return <GDPRConsentStep />;

      case 'complete':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Parfait ! Vos données sont maintenant sécurisées
            </h2>
            <p className="text-gray-600 mb-6">
              Félicitations ! Votre ADHD Life Assistant est maintenant protégé par un chiffrement 
              de niveau militaire. Vos données médicales sont en sécurité.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-600 text-2xl mb-2">🔐</div>
                <div className="font-medium text-green-800 mb-1">Chiffrement AES-256</div>
                <div className="text-sm text-green-600">Niveau militaire activé</div>
              </div>
              
              {biometricAvailable && enableBiometric && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-2xl mb-2">👆</div>
                  <div className="font-medium text-blue-800 mb-1">Biométrie configurée</div>
                  <div className="text-sm text-blue-600">Connexion ultra-rapide</div>
                </div>
              )}
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-purple-600 text-2xl mb-2">⚖️</div>
                <div className="font-medium text-purple-800 mb-1">Conformité RGPD</div>
                <div className="text-sm text-purple-600">Droits respectés</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-left">
              <div className="flex items-start space-x-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="text-sm text-yellow-700">
                  <strong>Important :</strong> Gardez votre mot de passe en lieu sûr ! 
                  Si vous l'oubliez, il sera impossible de récupérer vos données chiffrées.
                  Nous ne pouvons pas les déchiffrer pour vous (c'est ça, la vraie sécurité !).
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepProgress = () => {
    const steps: Step[] = ['welcome', 'password', 'biometric', 'gdpr', 'complete'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'password':
        return masterPassword && confirmPassword && masterPassword === confirmPassword && passwordScore >= 60;
      case 'biometric':
      case 'gdpr':
      case 'welcome':
        return true;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Configuration sécurité</span>
              <span>{Math.round(getStepProgress())}% terminé</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          {renderStepContent()}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={currentStep === 'welcome' ? onClose : () => setCurrentStep('welcome')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isProcessing}
            >
              {currentStep === 'welcome' ? 'Annuler' : 'Retour'}
            </button>

            <button
              onClick={handleStepComplete}
              disabled={!canProceed() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Traitement...</span>
                </>
              ) : (
                <span>
                  {currentStep === 'complete' ? 'Terminer' : 'Continuer'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour l'étape de consentement RGPD
function GDPRConsentStep() {
  const gdprService = GDPRService.getInstance();
  const [consents, setConsents] = useState(gdprService.getAllConsents());

  const updateConsent = (consentId: string, granted: boolean) => {
    gdprService.updateConsent(consentId, granted);
    setConsents(gdprService.getAllConsents());
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">⚖️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Vos droits et notre engagement
        </h2>
        <p className="text-gray-600">
          Conformément au RGPD, vous avez le contrôle total sur vos données.
        </p>
      </div>

      <div className="space-y-4">
        {consents.map(consent => (
          <div key={consent.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <h3 className="font-medium text-gray-800 mb-1">{consent.purpose}</h3>
                <p className="text-sm text-gray-600 mb-2">{consent.description}</p>
                {consent.type === 'essential' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Obligatoire
                  </span>
                )}
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={consent.granted}
                  onChange={(e) => updateConsent(consent.id, e.target.checked)}
                  disabled={consent.type === 'essential'}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>
          </div>
        ))}

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600">✅</div>
            <div className="text-sm text-green-700">
              <strong>Vos droits RGPD :</strong> Vous pouvez à tout moment accéder à vos données, 
              les corriger, les supprimer, ou les récupérer dans un format standard. 
              Ces options sont disponibles dans les paramètres de l'app.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}