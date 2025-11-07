import { NextRequest, NextResponse } from "next/server";

// Cette route envoie des emails via un service externe
// Vous pouvez utiliser Resend, SendGrid, ou tout autre service d'email
// Pour l'instant, on simule l'envoi (à remplacer par un vrai service)

const STATUS_MESSAGES: Record<string, { subject: string; body: string }> = {
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
    body: (name: string, status: string) => {
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

      return statusMessages[status] || `
Bonjour ${name},

Le statut de votre projet a été mis à jour: ${status}

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

    // TODO: Remplacer par un vrai service d'email (Resend, SendGrid, etc.)
    // Exemple avec Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'WebStarter <noreply@webstarter.com>',
      to: to,
      subject: subject,
      html: bodyText.replace(/\n/g, '<br>'),
    });
    */

    // Pour l'instant, on log juste (à remplacer)
    console.log("Email à envoyer:", {
      to,
      subject,
      body: bodyText,
    });

    // Simuler un délai d'envoi
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: "Email envoyé (simulé - à configurer avec un vrai service)",
    });
  } catch (error: any) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}

