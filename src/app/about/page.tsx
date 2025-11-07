export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        À propos de WebStarter
      </h1>

      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-xl text-gray-700 mb-8">
          WebStarter transforme vos idées en sites web professionnels, modernes et performants.
          Nous accompagnons chaque projet avec expertise et transparence.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Notre processus</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">1️⃣</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Remplissez la demande</h3>
                <p className="text-gray-700">
                  Décrivez votre projet en détail via notre formulaire simple et intuitif.
                  Partagez vos idées, inspirations et besoins spécifiques.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">2️⃣</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Analyse sous 48h</h3>
                <p className="text-gray-700">
                  Notre équipe analyse votre demande et vous répond dans un délai maximum de 48h.
                  Nous vous proposons une solution adaptée à vos besoins.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">3️⃣</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Vous recevez une réponse</h3>
                <p className="text-gray-700">
                  Acceptation, demande de précisions ou proposition alternative,
                  vous êtes toujours informé de la suite de votre projet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">4️⃣</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">On commence votre site</h3>
                <p className="text-gray-700">
                  Une fois accepté, nous démarrons immédiatement le développement
                  de votre site web avec un suivi régulier de l'avancement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">➕</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Accompagnement & support</h3>
                <p className="text-gray-700">
                  Nous vous accompagnons tout au long du projet avec un support réactif
                  et une communication transparente jusqu'à la livraison.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Nos avantages</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">⚡ Réponse en 48h</h3>
              <p className="text-gray-700">
                Engagement ferme : nous vous répondons sous 48h maximum.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">💰 Prix transparents</h3>
              <p className="text-gray-700">
                Pas de surprises : devis clair et détaillé dès le départ.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🎯 Support client</h3>
              <p className="text-gray-700">
                Accompagnement personnalisé tout au long de votre projet.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🚀 Livraison rapide</h3>
              <p className="text-gray-700">
                Sites performants et modernes livrés dans les délais convenus.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center p-8 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Prêt à démarrer votre projet ?</h2>
          <p className="text-gray-700 mb-6">
            Remplissez notre formulaire et recevez une réponse sous 48h.
          </p>
          <a
            href="/request"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
          >
            Je veux un site web
          </a>
        </section>
      </div>
    </div>
  );
}

