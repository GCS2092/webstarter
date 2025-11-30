// Service Worker pour Firebase Cloud Messaging
// Ce fichier doit être dans le dossier public/ pour être accessible à la racine du site

// Import des scripts Firebase nécessaires
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (doit correspondre à celle du client)
const firebaseConfig = {
  apiKey: "AIzaSyDWmweYdJcJuw8BctcQOOvsCbiED3rmceI",
  authDomain: "webstarter-288e8.firebaseapp.com",
  projectId: "webstarter-288e8",
  storageBucket: "webstarter-288e8.firebasestorage.app",
  messagingSenderId: "908089529916",
  appId: "1:908089529916:web:62d70f147169747ec25539"
};

// Initialiser Firebase dans le service worker
firebase.initializeApp(firebaseConfig);

// Récupérer l'instance de messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan (quand l'application est fermée ou en arrière-plan)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez reçu un nouveau message',
    icon: '/favicon.ico', // Vous pouvez changer cette icône
    badge: '/favicon.ico',
    data: payload.data || {},
    requireInteraction: false,
    silent: false,
  };

  // Afficher la notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification cliquée:', event);
  
  event.notification.close();

  // Ouvrir ou se concentrer sur la fenêtre de l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la mettre au premier plan
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        // Vous pouvez personnaliser l'URL selon les données de la notification
        const urlToOpen = event.notification.data?.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gérer l'installation du service worker
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installé');
  self.skipWaiting(); // Activer immédiatement le nouveau service worker
});

// Gérer l'activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activé');
  event.waitUntil(clients.claim()); // Prendre le contrôle de toutes les pages
});

