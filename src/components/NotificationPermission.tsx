"use client";

import { useState, useEffect } from "react";
import { getFCMToken, onMessageListener } from "@/lib/firebase";

/**
 * Composant pour demander la permission de notification et gérer les notifications push
 */
export default function NotificationPermission() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Vérifier l'état actuel de la permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
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
        // Obtenir le token FCM
        const fcmToken = await getFCMToken();
        setToken(fcmToken);

        if (fcmToken) {
          // Ici, vous pouvez envoyer le token à votre serveur pour le sauvegarder
          console.log("Token FCM à sauvegarder:", fcmToken);
          // Exemple: await fetch('/api/save-token', { method: 'POST', body: JSON.stringify({ token: fcmToken }) });
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

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2">🔔 Activer les notifications</h3>
      <p className="text-sm text-gray-600 mb-4">
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
        <p className="text-xs text-gray-500 mt-2">
          ✅ Notifications activées
        </p>
      )}
    </div>
  );
}

