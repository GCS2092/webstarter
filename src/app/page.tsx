export default function Home() {
  return (
    <main className="flex flex-col items-center text-center p-12">
      <h1 className="font-bold text-4xl mb-4">Bienvenue sur WebStarter 🚀</h1>
      <p className="mb-6 text-lg max-w-xl">
        Créez votre site web professionnel facilement.  
        Remplissez votre demande et nous vous répondons sous 48h.
      </p>
      <a
        href="/request"
        className="bg-black text-white px-4 py-2 rounded-md"
      >
        Je veux un site web
      </a>
    </main>
  );
}
