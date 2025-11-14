import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configuration Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Votre adresse Gmail
      pass: process.env.GMAIL_APP_PASSWORD, // Mot de passe d'application Gmail
    },
  });
};

const STATUS_MESSAGES: Record<string, { subject: string; body: (name: string, status?: string) => string }> = {
  confirmation: {
    subject: "Confirmation de votre demande - WebStarter",
    body: (name: string) => `
Bonjour ${name},

Nous avons bien reçu votre demande de projet web. ✅

Notre équipe va analyser votre demande et vous répondra sous 48h.

Vous recevrez un email dès que nous aurons une réponse pour vous.

Cordialement,
L'équipe WebStarter 🚀
    `,
  },
  status_change: {
    subject: "Mise à jour de votre projet - WebStarter",
    body: (name: string, status?: string) => {
      const statusMessages: Record<string, string> = {
        acceptee: `
Bonjour ${name},

Excellente nouvelle ! 🎉

Votre demande de projet a été acceptée. Nous allons commencer à travailler sur votre site web.

Vous recevrez prochainement un email avec les prochaines étapes.

Cordialement,
L'équipe WebStarter 🚀
        `,
        refusee: `
Bonjour ${name},

Nous avons bien reçu votre demande, mais malheureusement nous ne pouvons pas l'accepter pour le moment.

Nous restons à votre disposition pour discuter d'alternatives ou de projets futurs.

Cordialement,
L'équipe WebStarter 🚀
        `,
        en_attente_info: `
Bonjour ${name},

Nous avons besoin de quelques informations supplémentaires concernant votre projet.

Merci de compléter votre demande ou de nous contacter directement.

Cordialement,
L'équipe WebStarter 🚀
        `,
        en_cours: `
Bonjour ${name},

Votre projet est maintenant en cours de développement.

Nous vous tiendrons informé de l'avancement régulièrement.

Cordialement,
L'équipe WebStarter 🚀
        `,
        termine: `
Bonjour ${name},

Votre projet est terminé ! 🎉

Nous vous contacterons prochainement pour la livraison.

Cordialement,
L'équipe WebStarter 🚀
        `,
      };

      return statusMessages[status || ""] || `
Bonjour ${name},

Le statut de votre projet a été mis à jour: ${status || "inconnu"}

Cordialement,
L'équipe WebStarter 🚀
      `;
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type, clientName, status } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Récupérer le message selon le type
    const messageConfig = STATUS_MESSAGES[type];
    if (!messageConfig) {
      return NextResponse.json({ error: "Type d'email invalide" }, { status: 400 });
    }

    const subject = messageConfig.subject;
    const bodyText =
      type === "confirmation"
        ? messageConfig.body(clientName || "Client")
        : messageConfig.body(clientName || "Client", status || "");

    // Vérifier que Gmail est configuré
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Gmail non configuré - Email simulé:", {
        to,
        subject,
        body: bodyText,
        hasGmailUser: !!process.env.GMAIL_USER,
        hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
      });
      return NextResponse.json({
        success: false,
        message: "Email non envoyé - Gmail non configuré",
        warning: "Configurez GMAIL_USER et GMAIL_APP_PASSWORD dans .env.local",
        details: {
          hasGmailUser: !!process.env.GMAIL_USER,
          hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
        },
      });
    }

    // Envoyer l'email via Gmail
    try {
      console.log("Tentative d'envoi d'email à:", to);
      console.log("GMAIL_USER configuré:", !!process.env.GMAIL_USER);
      console.log("GMAIL_APP_PASSWORD configuré:", !!process.env.GMAIL_APP_PASSWORD);

      const transporter = createTransporter();
      const htmlBody = bodyText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => `<p style="margin: 10px 0;">${line}</p>`)
        .join("");

      const mailOptions = {
        from: `WebStarter <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">WebStarter 🚀</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              ${htmlBody}
            </div>
            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>Cet email a été envoyé automatiquement par WebStarter</p>
            </div>
          </div>
        `,
        text: bodyText, // Version texte pour les clients qui ne supportent pas HTML
      };

      console.log("Options email:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      const info = await transporter.sendMail(mailOptions);

      console.log("Email envoyé avec succès:", {
        messageId: info.messageId,
        to: to,
        response: info.response,
      });

      return NextResponse.json({
        success: true,
        message: "Email envoyé avec succès",
        messageId: info.messageId,
        response: info.response,
      });
    } catch (emailError: any) {
      console.error("Erreur détaillée lors de l'envoi de l'email:", {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
        stack: emailError.stack,
      });

      // Messages d'erreur plus détaillés
      let errorMessage = emailError.message;
      if (emailError.code === "EAUTH") {
        errorMessage = "Erreur d'authentification Gmail. Vérifiez votre email et mot de passe d'application.";
      } else if (emailError.code === "ECONNECTION") {
        errorMessage = "Impossible de se connecter au serveur Gmail. Vérifiez votre connexion internet.";
      } else if (emailError.responseCode === 535) {
        errorMessage = "Mot de passe d'application Gmail incorrect. Vérifiez GMAIL_APP_PASSWORD dans .env.local";
      }

      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi de l'email",
          message: errorMessage,
          details: {
            code: emailError.code,
            command: emailError.command,
            response: emailError.response,
            responseCode: emailError.responseCode,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}

