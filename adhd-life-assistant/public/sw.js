// Service Worker pour ADHD Life Assistant - PWA avec cache offline

const CACHE_NAME = 'adhd-assistant-v1';
const STATIC_CACHE = 'adhd-static-v1';

// Fichiers essentiels à mettre en cache pour le mode offline
const ESSENTIAL_FILES = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        await cache.addAll(ESSENTIAL_FILES);
        console.log('Essential files cached');
      } catch (error) {
        console.warn('Some files failed to cache:', error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      // Nettoie les anciens caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name !== CACHE_NAME && name !== STATIC_CACHE
      );
      
      await Promise.all(
        oldCaches.map(name => caches.delete(name))
      );
      
      await self.clients.claim();
    })()
  );
});

// Stratégie de cache: Network First avec fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignore les requêtes non-HTTP
  if (!request.url.startsWith('http')) return;
  
  // Ignore les requêtes API externes (Claude)
  if (request.url.includes('api.anthropic.com')) return;
  
  event.respondWith(
    (async () => {
      try {
        // Essaie le réseau d'abord
        const networkResponse = await fetch(request);
        
        // Met en cache les réponses réussies
        if (networkResponse.ok && request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Fallback sur le cache si le réseau échoue
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fallback ultime pour les pages
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        
        // Retourne une réponse d'erreur basique
        return new Response(
          JSON.stringify({ 
            error: 'Offline - Cette fonctionnalité nécessite une connexion',
            offline: true 
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      
      let clientToFocus = null;
      
      // Trouve une fenêtre ouverte ou en ouvre une nouvelle
      for (const client of clients) {
        if (client.url.includes(data.appUrl)) {
          clientToFocus = client;
          break;
        }
      }
      
      if (clientToFocus) {
        await clientToFocus.focus();
        clientToFocus.postMessage({
          type: 'REMINDER_ACTION',
          action: action || 'open',
          reminderId: data.reminderId
        });
      } else {
        await self.clients.openWindow(data.appUrl);
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { reminder, scheduledTime } = event.data;
    
    // Calcule le délai jusqu'à la notification
    const delay = scheduledTime - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(`💊 ${reminder.name}`, {
          body: `Il est temps de prendre votre médicament`,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: `reminder-${reminder.id}`,
          requireInteraction: true,
          actions: [
            {
              action: 'taken',
              title: 'Pris ✅'
            },
            {
              action: 'snooze',
              title: 'Snooze 15min ⏰'
            },
            {
              action: 'later',
              title: 'Rappel 1h ⏰'
            }
          ],
          data: {
            reminderId: reminder.id,
            appUrl: event.source.url || '/'
          }
        });
      }, delay);
    }
  }
});