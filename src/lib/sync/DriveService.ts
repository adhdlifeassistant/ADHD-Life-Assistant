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
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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
    const accessToken = this.authProvider.getAccessToken();
    if (!accessToken) {
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

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
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
    const accessToken = this.authProvider.getAccessToken();
    if (!accessToken) {
      return { used: 0, limit: 0 };
    }

    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
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
}