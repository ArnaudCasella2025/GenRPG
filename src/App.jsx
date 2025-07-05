import React, { useState } from "react";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;


function parseNarrationAndChoices(rawText) {
  try {
    const parts = rawText.split(/Choix\s*:/i);
    const narrationBlock = parts[0].trim();
    const narration = narrationBlock.replace(/^Narration:\s*/i, "").trim();

    let choices = [];

    if (parts[1]) {
      choices = parts[1]
        .trim()
        .split(/\n+/)
        .map(line => line.trim().replace(/^\d+\.\s*/, ""))
        .filter(choice => choice.length > 0);
    }

    if (!narration || choices.length < 2) {
      throw new Error("Format inattendu ou incomplet");
    }

    return { narration, choices };
  } catch (e) {
    console.warn("⚠️ Erreur parsing GPT:", e);
    return {
      narration: "⚠️ Erreur de génération IA. Impossible d'afficher cette scène.",
      choices: []
    };
  }
}

const App = () => {
  const [loading, setLoading] = useState(false);
  const [narration, setNarration] = useState(""); // 💬 nouvelle zone de texte IA
  const [hasStarted, setHasStarted] = useState(false);
  const [choices, setChoices] = useState([]);
  const [historyMessages, setHistoryMessages] = useState([]);

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
              content: `Tu es un maître du jeu dans un jeu de rôle textuel. À chaque tour, tu dois raconter la suite de l'aventure de manière immersive, puis proposer exactement 3 choix d'actions possibles.

                Respecte strictement ce format :

                Narration: [ta narration ici, en 2 à 5 phrases]

                Choix:
                1. [Premier choix]
                2. [Deuxième choix]
                3. [Troisième choix]

                N’inclus rien d’autre dans ta réponse. Ne répète pas les règles. Commence directement par : Narration:`
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
      const { narration, choices } = parseNarrationAndChoices(aiResponse);
      setNarration(narration);
      setChoices(choices);
      setHasStarted(true);
    } catch (error) {
      console.error("Erreur inattendue :", error);
      setNarration("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceClick = async (choiceText) => {
  if (loading) return;
  setLoading(true);

  const updatedMessages = [
    ...historyMessages,
    {
      role: "user",
      content: `Je choisis : ${choiceText}`
    }
  ];

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
            content: `Tu es un maître du jeu dans un jeu de rôle textuel. À chaque tour, tu dois raconter la suite de l'aventure de manière immersive, puis proposer exactement 3 choix d'actions possibles.\n\nRespecte strictement ce format :\n\nNarration: [ta narration ici, en 2 à 5 phrases]\n\nChoix:\n1. [Premier choix]\n2. [Deuxième choix]\n3. [Troisième choix]\n\nCommence toujours par : Narration:`
          },
          ...updatedMessages
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    const parsed = parseNarrationAndChoices(aiResponse);
    setNarration(parsed.narration);
    setChoices(parsed.choices);
    setHistoryMessages([...updatedMessages, {
      role: "assistant",
      content: aiResponse
    }]);
  } catch (err) {
    console.error("Erreur :", err);
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
          <div className="mt-4 space-y-2">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceClick(choice)}
                disabled={loading}
                className="w-full bg-yellow-200 hover:bg-yellow-300 text-gray-900 font-medium py-2 px-4 rounded-md"
              >
                {choice}
              </button>
            ))}
          </div>

          {!hasStarted && (
            <div className="flex justify-center mt-6">
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