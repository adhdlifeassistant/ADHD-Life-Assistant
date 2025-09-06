import { GoogleAuthProvider } from '@/lib/auth/GoogleAuthProvider';

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size: number;
  mimeType: string;
  appProperties?: Record<string, string>;
}

export interface SyncMetadata {
  module: string;
  version: string;
  timestamp: number;
  deviceId: string;
  checksum: string;
}

export class DriveService {
  private authProvider: GoogleAuthProvider;
  private readonly APP_FOLDER = 'appDataFolder';
  private readonly MIME_TYPE = 'application/json';
  private deviceId: string;

  constructor(authProvider: GoogleAuthProvider) {
    this.authProvider = authProvider;
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('adhd_device_id');
    if (!deviceId) {
      deviceId = this.generateUniqueId();
      localStorage.setItem('adhd_device_id', deviceId);
    }
    return deviceId;
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
  }

  private generateChecksum(data: any): string {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  async uploadModule(module: string, data: any, version: string = '1.0'): Promise<DriveFile> {
    console.log('🚀 DRIVE DEBUG: uploadModule appelé pour:', module);
    const accessToken = this.authProvider.getAccessToken();
    console.log('🚀 DRIVE DEBUG: accessToken présent:', !!accessToken);
    
    if (!accessToken) {
      console.error('❌ DRIVE DEBUG: Token d\'accès manquant');
      throw new Error('Token d\'accès manquant');
    }

    const timestamp = Date.now();
    const checksum = this.generateChecksum(data);
    
    const metadata: SyncMetadata = {
      module,
      version,
      timestamp,
      deviceId: this.deviceId,
      checksum
    };

    const fileContent = {
      metadata,
      data
    };

    const fileName = `adhd_${module}_${timestamp}.json`;
    
    // Métadonnées du fichier Drive
    const driveMetadata = {
      name: fileName,
      parents: [this.APP_FOLDER],
      description: `ADHD Life Assistant - Module: ${module}`,
      appProperties: {
        module,
        version,
        timestamp: timestamp.toString(),
        deviceId: this.deviceId,
        checksum
      }
    };

    // Créer FormData pour l'upload multipart
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(driveMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(fileContent)], { type: this.MIME_TYPE }));

    console.log('📤 DRIVE DEBUG: Envoi requête upload vers Google Drive API...');
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: form
    });

    console.log('📤 DRIVE DEBUG: Réponse Google Drive:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DRIVE DEBUG: Upload échoué:', response.status, errorText);
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ DRIVE DEBUG: Upload réussi, file ID:', result.id);
    
    // Nettoyer les anciens fichiers du même module (garder les 5 plus récents)
    await this.cleanupOldFiles(module, accessToken);
    
    return {
      id: result.id,
      name: result.name,
      modifiedTime: result.modifiedTime || new Date().toISOString(),
      size: parseInt(result.size) || 0,
      mimeType: result.mimeType || this.MIME_TYPE,
      appProperties: driveMetadata.appProperties
    };
  }

  async downloadLatestModule(module: string): Promise<{ file: DriveFile; content: any } | null> {
    const accessToken = this.authProvider.getAccessToken();
    if (!accessToken) {
      throw new Error('Token d\'accès manquant');
    }

    // Chercher les fichiers du module, triés par date de modification
    const query = `parents in '${this.APP_FOLDER}' and appProperties has {key='module' and value='${module}'} and trashed=false`;
    const listResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size,mimeType,appProperties)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!listResponse.ok) {
      throw new Error(`List files failed: ${listResponse.statusText}`);
    }

    const listResult = await listResponse.json();
    if (!listResult.files || listResult.files.length === 0) {
      return null;
    }

    const latestFile = listResult.files[0];
    
    // Télécharger le contenu
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${latestFile.id}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!downloadResponse.ok) {
      throw new Error(`Download failed: ${downloadResponse.statusText}`);
    }

    const content = await downloadResponse.json();
    
    return {
      file: {
        id: latestFile.id,
        name: latestFile.name,
        modifiedTime: latestFile.modifiedTime,
        size: parseInt(latestFile.size) || 0,
        mimeType: latestFile.mimeType,
        appProperties: latestFile.appProperties
      },
      content
    };
  }

  async checkRemoteChanges(module: string): Promise<{ hasChanges: boolean; latestTimestamp: number }> {
    const accessToken = this.authProvider.getAccessToken();
    if (!accessToken) {
      return { hasChanges: false, latestTimestamp: 0 };
    }

    try {
      const query = `parents in '${this.APP_FOLDER}' and appProperties has {key='module' and value='${module}'} and trashed=false`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&pageSize=1&fields=files(appProperties)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        return { hasChanges: false, latestTimestamp: 0 };
      }

      const result = await response.json();
      if (!result.files || result.files.length === 0) {
        return { hasChanges: false, latestTimestamp: 0 };
      }

      const latestFile = result.files[0];
      const remoteTimestamp = parseInt(latestFile.appProperties?.timestamp || '0');
      const localTimestamp = parseInt(localStorage.getItem(`adhd_${module}_timestamp`) || '0');

      return {
        hasChanges: remoteTimestamp > localTimestamp,
        latestTimestamp: remoteTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la vérification des changements pour ${module}:`, error);
      return { hasChanges: false, latestTimestamp: 0 };
    }
  }

  async listModules(): Promise<Array<{ module: string; timestamp: number; deviceId: string }>> {
    const accessToken = this.authProvider.getAccessToken();
    if (!accessToken) {
      return [];
    }

    try {
      const query = `parents in '${this.APP_FOLDER}' and appProperties has {key='module'} and trashed=false`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(appProperties)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      const modules = new Map<string, { timestamp: number; deviceId: string }>();

      result.files?.forEach((file: any) => {
        const props = file.appProperties;
        if (props?.module && props?.timestamp) {
          const module = props.module;
          const timestamp = parseInt(props.timestamp);
          const deviceId = props.deviceId || 'unknown';
          
          if (!modules.has(module) || modules.get(module)!.timestamp < timestamp) {
            modules.set(module, { timestamp, deviceId });
          }
        }
      });

      return Array.from(modules.entries()).map(([module, { timestamp, deviceId }]) => ({
        module,
        timestamp,
        deviceId
      }));
    } catch (error) {
      console.error('Erreur lors de la liste des modules:', error);
      return [];
    }
  }

  private async cleanupOldFiles(module: string, accessToken: string): Promise<void> {
    try {
      const query = `parents in '${this.APP_FOLDER}' and appProperties has {key='module' and value='${module}'} and trashed=false`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) return;

      const result = await response.json();
      const files = result.files || [];

      // Garder seulement les 5 fichiers les plus récents, supprimer les autres
      if (files.length > 5) {
        const filesToDelete = files.slice(5);
        
        for (const file of filesToDelete) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
        }
      }
    } catch (error) {
      console.warn(`Nettoyage des anciens fichiers échoué pour ${module}:`, error);
    }
  }

  async getStorageUsage(): Promise<{ used: number; limit: number }> {
    let accessToken = this.authProvider.getAccessToken();
    console.log('🔍 DRIVE DEBUG: getStorageUsage() - token présent:', !!accessToken);
    console.log('🔍 DRIVE DEBUG: getStorageUsage() - token length:', accessToken?.length || 0);
    
    // NOUVEAU : Vérifier expiration du token
    const tokenTimestamp = localStorage.getItem('auth_token_timestamp');
    const currentTime = Date.now();
    if (tokenTimestamp) {
      const tokenAge = currentTime - parseInt(tokenTimestamp);
      const tokenAgeMinutes = Math.floor(tokenAge / (1000 * 60));
      console.log('🕒 TOKEN DEBUG: Token timestamp:', new Date(parseInt(tokenTimestamp)).toISOString());
      console.log('🕒 TOKEN DEBUG: Current time:', new Date(currentTime).toISOString());
      console.log('🕒 TOKEN DEBUG: Token age (minutes):', tokenAgeMinutes);
      console.log('🕒 TOKEN DEBUG: Token expired (>55min)?', tokenAgeMinutes > 55);
      
      // Si le token a plus de 55 minutes, tenter un refresh
      if (tokenAgeMinutes > 55) {
        console.log('🔄 TOKEN DEBUG: Token probablement expiré, tentative de refresh...');
        try {
          const newToken = await this.authProvider.refreshAccessToken();
          console.log('✅ TOKEN DEBUG: Token refreshed successfully, new length:', newToken?.length || 0);
          // Utiliser le nouveau token
          accessToken = newToken;
        } catch (refreshError) {
          console.error('❌ TOKEN DEBUG: Refresh failed:', refreshError);
          return { used: 0, limit: 0 };
        }
      }
    } else {
      console.log('⚠️ TOKEN DEBUG: Pas de timestamp de token trouvé!');
    }
    
    if (!accessToken) {
      console.log('❌ DRIVE DEBUG: getStorageUsage() - Pas de token d\'accès');
      return { used: 0, limit: 0 };
    }

    try {
      const url = 'https://www.googleapis.com/drive/v3/about?fields=storageQuota';
      
      // NOUVEAU : Décodage partiel du token JWT pour debug
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          // Decoder le payload (partie 2) du JWT
          const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
          console.log('🔍 JWT DEBUG: Token exp timestamp:', payload.exp);
          console.log('🔍 JWT DEBUG: Token exp date:', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A');
          console.log('🔍 JWT DEBUG: Token expired (exp)?', payload.exp ? (Date.now() / 1000) > payload.exp : 'Unknown');
          console.log('🔍 JWT DEBUG: Token scopes:', payload.scope || 'N/A');
          console.log('🔍 JWT DEBUG: Token audience:', payload.aud || 'N/A');
        }
      } catch (jwtError) {
        console.log('ℹ️ JWT DEBUG: Token n\'est pas un JWT ou erreur décodage:', jwtError);
      }
      
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };
      
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Requête vers Drive API...');
      console.log('📡 DRIVE DEBUG: getStorageUsage() - URL:', url);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Authorization header format check:');
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Starts with "Bearer "?', headers.Authorization.startsWith('Bearer '));
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Token part length:', headers.Authorization.substring(7).length);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Token preview:', `Bearer ${accessToken.substring(0, 30)}...`);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Headers complets:', headers);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Commande curl équivalente:');
      console.log(`curl -H "Authorization: Bearer ${accessToken}" "${url}"`);
      
      const response = await fetch(url, { headers });
      
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Response status:', response.status);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Response ok:', response.ok);
      console.log('📡 DRIVE DEBUG: getStorageUsage() - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ DRIVE DEBUG: getStorageUsage() - Réponse non OK');
        const errorText = await response.text();
        console.log('❌ DRIVE DEBUG: getStorageUsage() - Error response:', errorText);
        
        // NOUVEAU : Analyse détaillée de l'erreur 401
        if (response.status === 401) {
          console.log('🔍 401 DEBUG: Erreur 401 détectée - analysing...');
          try {
            const errorJson = JSON.parse(errorText);
            console.log('🔍 401 DEBUG: Error JSON:', errorJson);
            console.log('🔍 401 DEBUG: Error code:', errorJson.error?.code);
            console.log('🔍 401 DEBUG: Error message:', errorJson.error?.message);
          } catch (parseError) {
            console.log('🔍 401 DEBUG: Error response not JSON:', errorText);
          }
        }
        
        return { used: 0, limit: 0 };
      }

      const result = await response.json();
      const quota = result.storageQuota || {};
      
      return {
        used: parseInt(quota.usage || '0'),
        limit: parseInt(quota.limit || '0')
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du quota:', error);
      return { used: 0, limit: 0 };
    }
  }

  // NOUVEAU : Méthode de test avec scope minimal pour debugging 401
  async testMinimalScope(): Promise<{ success: boolean; response?: any; error?: string }> {
    const accessToken = this.authProvider.getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: 'Pas de token d\'accès' };
    }

    try {
      // Test avec scope minimal - juste lister les fichiers dans appDataFolder
      const url = 'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1&fields=files(id,name)';
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🧪 MINIMAL SCOPE TEST: Testing with drive.metadata.readonly equivalent...');
      console.log('🧪 MINIMAL SCOPE TEST: URL:', url);
      
      const response = await fetch(url, { headers });
      
      console.log('🧪 MINIMAL SCOPE TEST: Response status:', response.status);
      console.log('🧪 MINIMAL SCOPE TEST: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🧪 MINIMAL SCOPE TEST: Error response:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const result = await response.json();
      console.log('🧪 MINIMAL SCOPE TEST: Success! Result:', result);
      
      return { success: true, response: result };
    } catch (error) {
      console.error('🧪 MINIMAL SCOPE TEST: Exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}