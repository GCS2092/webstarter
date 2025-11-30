import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/firebase-admin";

/**
 * API Route pour envoyer une notification push via Firebase Cloud Messaging
 * 
 * Body attendu:
 * {
 *   "token": "token-fcm-du-client",
 *   "title": "Titre de la notification",
 *   "body": "Corps de la notification",
 *   "data": { "key": "value" } // optionnel
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, title, body: messageBody, data } = body;

    if (!token || !title || !messageBody) {
      return NextResponse.json(
        { error: "token, title et body sont requis" },
        { status: 400 }
      );
    }

    const messageId = await sendPushNotification(
      token,
      title,
      messageBody,
      data
    );

    return NextResponse.json({
      success: true,
      messageId,
      message: "Notification envoyée avec succès",
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi de la notification",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

