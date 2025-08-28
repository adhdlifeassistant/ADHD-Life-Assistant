'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erreur d\'authentification capturée:', error, errorInfo);
    
    // Annoncer l'erreur pour l'accessibilité
    this.announceError('Une erreur inattendue s\'est produite lors de l\'authentification');
  }

  private announceError(message: string) {
    if (typeof window === 'undefined') return;
    
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 5000);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private getErrorMessage(error: Error | null): string {
    if (!error) return 'Une erreur inattendue s\'est produite';

    const friendlyMessages: Record<string, string> = {
      'Network Error': 'Problème de connexion internet. Vérifiez votre réseau 📶',
      'popup_closed_by_user': 'Vous avez fermé la fenêtre de connexion. Pas de souci, réessayez quand vous voulez ! 😊',
      'access_denied': 'Accès refusé. Vous pouvez réessayer ou choisir un autre compte 🚫',
      'invalid_client': 'Configuration incorrecte de l\'application. Contactez le support technique 🔧',
      'server_error': 'Petit souci temporaire de notre côté. Réessayez dans quelques instants ⚙️',
      'timeout': 'La connexion prend trop de temps. Vérifiez votre connexion internet 🕐',
    };

    // Chercher un message amical correspondant
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.message.includes(key) || error.name.includes(key)) {
        return message;
      }
    }

    // Message générique bienveillant
    return 'Quelque chose s\'est mal passé lors de la connexion. Pas de panique, réessayez ! 💪';
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage(this.state.error);

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-lg border-2 border-red-100">
            <div className="text-center">
              {/* Icône d'erreur amicale */}
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Titre bienveillant */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Oups ! Un petit pépin... 🌱
              </h2>

              {/* Message d'erreur personnalisé */}
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
                <p className="text-red-700 leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              {/* Conseils et actions */}
              <div className="space-y-4">
                {/* Bouton de nouvelle tentative */}
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer
                </button>

                {/* Conseils de dépannage */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                  <h3 className="font-medium text-blue-900 mb-2">💡 Quelques conseils :</h3>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Vérifiez votre connexion internet</li>
                    <li>• Essayez de rafraîchir la page</li>
                    <li>• Désactivez temporairement les bloqueurs de pop-up</li>
                    <li>• Réessayez avec un autre navigateur si nécessaire</li>
                  </ul>
                </div>

                {/* Bouton de retour à l'accueil */}
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  Retour à l'accueil
                </button>
              </div>

              {/* Message de support */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Le problème persiste ? Pas de stress, ça arrive ! 
                  <br />Revenez plus tard ou contactez le support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;