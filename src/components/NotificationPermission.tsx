"use client";

import { useState, useEffect } from "react";
import { getFCMToken, onMessageListener } from "@/lib/firebase";

/**
 * Détecte si le navigateur est Safari
 */
function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isSafariUA = userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("chromium");
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  return isSafariUA || isIOS;
}

/**
 * Détecte si c'est Safari iOS (pas de support notifications push web)
 */
function isSafariIOS(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Composant pour demander la permission de notification et gérer les notifications push
 */
export default function NotificationPermission() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détecter Safari
    setIsSafariBrowser(isSafari());
    setIsIOS(isSafariIOS());

    // Vérifier l'état actuel de la permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }

    // Ne pas écouter les messages sur Safari iOS (pas supporté)
    if (isSafariIOS()) {
      return;
    }

    // Écouter les messages en temps réel (quand l'app est ouverte)
    onMessageListener()
      .then((payload) => {
        console.log("Message reçu en temps réel:", payload);
        // Vous pouvez afficher une notification personnalisée ici
        if (payload?.notification) {
          new Notification(payload.notification.title || "Nouvelle notification", {
            body: payload.notification.body,
            icon: "/favicon.ico",
          });
        }
      })
      .catch((err) => {
        console.error("Erreur lors de l'écoute des messages:", err);
      });
  }, []);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      // Demander la permission de notification
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === "granted") {
        // Obtenir le token FCM (ne fonctionne pas sur Safari iOS)
        if (isIOS) {
          console.warn("Les notifications push web ne sont pas supportées sur Safari iOS");
          setPermission("denied");
          return;
        }

        try {
          const fcmToken = await getFCMToken();
          setToken(fcmToken);

          if (fcmToken) {
            // Ici, vous pouvez envoyer le token à votre serveur pour le sauvegarder
            console.log("Token FCM à sauvegarder:", fcmToken);
            // Exemple: await fetch('/api/save-token', { method: 'POST', body: JSON.stringify({ token: fcmToken }) });
          }
        } catch (fcmError) {
          console.error("Erreur lors de l'obtention du token FCM:", fcmError);
          if (isSafariBrowser) {
            console.warn("FCM n'est pas entièrement supporté sur Safari. Utilisez Chrome, Firefox ou Edge pour les notifications push.");
          }
        }
      } else {
        console.warn("Permission de notification refusée");
      }
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Ne rien afficher si la permission est déjà accordée
  if (permission === "granted") {
    return null;
  }

  // Message spécial pour Safari iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm z-50">
        <h3 className="font-bold text-lg mb-2 dark:text-white">🔔 Notifications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Les notifications push web ne sont pas disponibles sur Safari iOS.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Pour recevoir des notifications, utilisez Chrome, Firefox ou Edge sur votre appareil, ou installez notre application native.
        </p>
      </div>
    );
  }

  // Message pour Safari macOS (support limité)
  if (isSafariBrowser && !isIOS) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm z-50">
        <h3 className="font-bold text-lg mb-2 dark:text-white">🔔 Activer les notifications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Les notifications push sur Safari nécessitent une configuration spéciale.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Pour une meilleure expérience, utilisez Chrome, Firefox ou Edge.
        </p>
        <button
          onClick={requestPermission}
          disabled={isRequesting || permission === "denied"}
          className="w-full bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRequesting
            ? "Activation..."
            : permission === "denied"
            ? "Notifications bloquées"
            : "Essayer quand même"}
        </button>
      </div>
    );
  }

  // Comportement normal pour les autres navigateurs
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2 dark:text-white">🔔 Activer les notifications</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Recevez des notifications en temps réel sur l'état de vos projets.
      </p>
      <button
        onClick={requestPermission}
        disabled={isRequesting || permission === "denied"}
        className="w-full bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRequesting
          ? "Activation..."
          : permission === "denied"
          ? "Notifications bloquées"
          : "Activer les notifications"}
      </button>
      {token && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ✅ Notifications activées
        </p>
      )}
    </div>
  );
}

