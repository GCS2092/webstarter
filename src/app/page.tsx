import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center text-center px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-bold text-5xl md:text-6xl mb-6">
          Bienvenue sur WebStarter 🚀
        </h1>
        <p className="mb-4 text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
          Créez votre site web professionnel facilement et rapidement
        </p>
        <p className="mb-8 text-lg text-gray-600 max-w-xl mx-auto">
          Notre équipe transforme vos idées en un site moderne et performant.
          Remplissez notre formulaire, nous analysons votre demande sous 48h.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/request"
            className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition text-lg"
          >
            Je veux un site web
          </Link>
          <Link
            href="/about"
            className="bg-white text-black border-2 border-black px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition text-lg"
          >
            En savoir plus
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Réponse en 48h</h3>
            <p className="text-gray-600 text-sm">
              Nous vous répondons dans un délai maximum de 48h
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-lg mb-2">Prix transparents</h3>
            <p className="text-gray-600 text-sm">
              Devis clair et détaillé dès le départ
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Support client</h3>
            <p className="text-gray-600 text-sm">
              Accompagnement personnalisé tout au long du projet
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-lg mb-2">Livraison rapide</h3>
            <p className="text-gray-600 text-sm">
              Sites performants livrés dans les délais convenus
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
