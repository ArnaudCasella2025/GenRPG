
import React, { useState } from "react";
import Header from "./components/Header";
import NarrationBox from "./components/NarrationBox";
import ChoiceButtons from "./components/ChoiceButtons";
import Loader from "./components/Loader";
import { parseNarrationAndChoices } from "./utils/parseResponse";
import { fetchInitialNarration, fetchNarrationFromChoice } from "./api/openai";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [narration, setNarration] = useState("");
  const [choices, setChoices] = useState([]);
  const [messages, setMessages] = useState([]); 

  const startAdventure = async () => {
    setLoading(true);
    try {
      const rawText = await fetchInitialNarration();
      const { narration, choices } = parseNarrationAndChoices(rawText);
      setNarration(narration);
      setChoices(choices);
      setHasStarted(true);
      setMessages([{ role: "assistant", content: rawText }]);
    } catch (err) {
      console.error("Erreur lors du chargement initial :", err);
    }
    setLoading(false);
  };

  const handleChoice = async (choice) => {
  setLoading(true);
  try {
    // Création du message user
    const userMessage = { role: "user", content: choice };

    // On construit le thread complet : system + anciens messages + ce nouveau userMessage
    const thread = [...messages, userMessage];

    // Envoi à l'API avec tout le contexte
    const rawText = await fetchNarrationFromChoice(thread);

    // Parsing de la réponse
    const { narration: newNarration, choices: newChoices } =
      parseNarrationAndChoices(rawText);

    // Mise à jour de l’UI
    setNarration(newNarration);
    setChoices(newChoices);

    // On enrichit l’historique avec la réponse assistant
    const assistantMessage = { role: "assistant", content: rawText };
    setMessages([...thread, assistantMessage]);
  } catch (err) {
    console.error("Erreur après un choix :", err);
  } finally {
    // 7️⃣ Fin du loading
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-gray-100 rounded-2xl shadow-xl p-6 text-gray-800">
        <Header />
        <NarrationBox narration={narration} /> {loading && <Loader />}
        
        {!hasStarted ? (
          <div className="flex justify-center mt-4">
            <button
              onClick={startAdventure}
              disabled={loading}
              className={`bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Chargement..." : "Commencer l’aventure"}
            </button>
          </div>
        ) : (
          <ChoiceButtons choices={choices} onSelect={handleChoice} isDisabled={loading} />
        )}
      </div>
    </div>
  );
}