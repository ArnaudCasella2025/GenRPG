import React, { useState } from "react";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [narration, setNarration] = useState(""); // 💬 nouvelle zone de texte IA
  const [hasStarted, setHasStarted] = useState(false);

  const handleStartAdventure = async () => {
    if (loading) return;
    setLoading(true);

    if (!OPENAI_API_KEY) {
      console.error("⚠️ Clé OpenAI manquante.");
      setNarration("Erreur : clé OpenAI manquante.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Tu es un maître du jeu. Raconte l’introduction d’une aventure fantasy dans un village mystérieux."
            }
          ],
          temperature: 0.8
        })
      });

      if (!response.ok) {
        console.error(`Erreur API (${response.status})`);
        setNarration("❌ Erreur lors de la connexion à OpenAI.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        console.error("Réponse inattendue :", data);
        setNarration("❌ Réponse IA invalide.");
        setLoading(false);
        return;
      }

      const aiResponse = data.choices[0].message.content;
      setNarration(aiResponse); // ✅ injecte dans le DOM
      setHasStarted(true);
    } catch (error) {
      console.error("Erreur inattendue :", error);
      setNarration("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-gray-100 rounded-2xl shadow-xl p-6 text-gray-800">
        <h1 className="text-2xl font-bold text-center mb-4">Chroniques d'une Aventure</h1>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[150px] bg-white text-lg leading-relaxed mb-6 whitespace-pre-line">
          {loading ? "⌛ Chargement en cours..." : narration || "👀 En attente de votre décision..."}
        </div>
        <div className="flex justify-center">
          {!hasStarted && (
            <div className="flex justify-center">
              <button
                onClick={handleStartAdventure}
                disabled={loading}
                className={`bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Chargement..." : "Commencer l’aventure"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;