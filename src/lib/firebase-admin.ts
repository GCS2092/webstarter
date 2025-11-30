// Configuration Firebase Admin SDK (côté serveur uniquement)
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

// Configuration du compte de service Firebase
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "webstarter-288e8",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "3f6016fd9bbfcfb28dca39951600cdfab8092df7",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@webstarter-288e8.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "105803298127845604360",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40webstarter-288e8.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialiser Firebase Admin (une seule fois)
let adminApp: App;
if (getApps().length === 0) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase Admin:", error);
  }
} else {
  adminApp = getApps()[0];
}

// Fonction pour envoyer une notification push
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> {
  try {
    const messaging = getMessaging(adminApp);
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await messaging.send(message);
    return response;
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    throw error;
  }
}

// Fonction pour envoyer une notification à plusieurs tokens
export async function sendMulticastNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<any> {
  try {
    const messaging = getMessaging(adminApp);
    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await messaging.sendEachForMulticast(message);
    return response;
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la notification multicast:", error);
    throw error;
  }
}

export { adminApp };

