// Configuration Firebase côté client
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDWmweYdJcJuw8BctcQOOvsCbiED3rmceI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "webstarter-288e8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "webstarter-288e8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "webstarter-288e8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "908089529916",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:908089529916:web:62d70f147169747ec25539"
};

// Initialiser Firebase (éviter les initialisations multiples)
let app: FirebaseApp;
if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== "undefined") {
  app = getApps()[0];
}

// Fonction pour obtenir le token FCM (Firebase Cloud Messaging)
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Vérifier que le service worker est enregistré
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker prêt:', registration);
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BDylwcUQcdOS1yGIqB8SqlDFrH4lTliAFD4SnorGq5mtlP_6Rlr30Yo98p_f9do9Jq48einPSPyR4rypcHY1BhE",
      serviceWorkerRegistration: await navigator.serviceWorker.ready
    });
    
    if (token) {
      console.log('Token FCM obtenu:', token);
    } else {
      console.log('Aucun token FCM disponible. Demandez la permission de notification.');
    }
    
    return token;
  } catch (error: any) {
    console.error("Erreur lors de la récupération du token FCM:", error);
    
    // Gérer les erreurs courantes
    if (error.code === 'messaging/permission-blocked') {
      console.warn('Les notifications sont bloquées par l\'utilisateur');
    } else if (error.code === 'messaging/registration-token-not-found') {
      console.warn('Service Worker non trouvé. Vérifiez que firebase-messaging-sw.js est dans public/');
    }
    
    return null;
  }
}

// Fonction pour écouter les messages en arrière-plan
export function onMessageListener(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export { app };

