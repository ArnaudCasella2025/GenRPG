import React, { useState } from "react";
import Header from "./components/Header";
import NarrationBox from "./components/NarrationBox";
import ChoiceButtons from "./components/ChoiceButtons";
import CustomChoice from "./components/CustomChoice";
import LoadingOverlay from "./components/LoadingOverlay";
import { parseNarrationAndChoices } from "./utils/parseResponse";
import { fetchInitialNarration, fetchNarrationFromChoice } from "./api/openai";
import { fetchSceneImage } from "./api/dalle";

export default function App() {
  const [hasStarted, setHasStarted]       = useState(false);
  const [narration, setNarration]         = useState("");
  const [choices, setChoices]             = useState([]);
  const [customChoice, setCustomChoice]   = useState("");
  const [textLoading, setTextLoading]     = useState(false);
  const [imageLoading, setImageLoading]   = useState(false);
  const [sceneImage, setSceneImage]       = useState(null);
  const [history, setHistory]             = useState([{ role: "system", content: "" }]);

  const startAdventure = async () => {
    // 1) On met les deux overlays en route
    setTextLoading(true);
    setImageLoading(true);

    // 2) Génération du texte d’intro
    let rawText;
    try {
      rawText = await fetchInitialNarration();
      const { narration: newNarr, choices: newCh } = parseNarrationAndChoices(rawText);
      setNarration(newNarr);
      setChoices(newCh);
      setHistory([{ role: "system", content: "" }, { role: "assistant", content: rawText }]);
      setHasStarted(true);
    } catch (e) {
      console.error("Erreur intro :", e);
    }
    setTextLoading(false);

    // 3) Génération de l’image pour l’intro
    try {
      const url = await fetchSceneImage(rawText);
      setSceneImage(url);
    } catch (e) {
      console.error("Erreur image intro :", e);
    }
    setImageLoading(false);
  };

  const handleChoice = async (choice) => {
    // 1) Overlay texte + image activés
    setTextLoading(true);
    setImageLoading(true);

    // 2) Envoi du choix et génération du nouveau texte
    let rawText;
    try {
      const userMessage = { role: "user", content: choice };
      const thread      = [...history, userMessage];
      rawText = await fetchNarrationFromChoice(thread);
      const { narration: newNarr, choices: newCh } = parseNarrationAndChoices(rawText);
      setNarration(newNarr);
      setChoices(newCh);
      setHistory([...thread, { role: "assistant", content: rawText }]);
    } catch (e) {
      console.error("Erreur handleChoice :", e);
    }
    setTextLoading(false);

    // 3) Génération de l’image pour la scène
    try {
      const url = await fetchSceneImage(rawText);
      setSceneImage(url);
    } catch (e) {
      console.error("Erreur image scène :", e);
    }
    setImageLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-gray-100 rounded-2xl shadow-xl p-6 text-gray-800">
        <Header />

        {/* Scène : image + overlay */}
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
          <LoadingOverlay visible={imageLoading} text="Génération de l’image…" />
          {sceneImage && (
            <img
              src={sceneImage}
              alt="Illustration de la scène"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Narration + boutons + overlay */}
        <div className="relative mb-4">
          <LoadingOverlay visible={textLoading} text="⏳ Chargement en cours…" />
          <NarrationBox narration={narration} loading={false} />

          {!hasStarted ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={startAdventure}
                disabled={textLoading}
                className={`bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow ${
                  textLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {textLoading ? "Chargement..." : "Commencer l’aventure"}
              </button>
            </div>
          ) : (
            !textLoading && (
              <div className="mt-4 space-y-2">
                <ChoiceButtons
                  choices={choices}
                  onSelect={handleChoice}
                  isDisabled={textLoading}
                />
                <CustomChoice
                  value={customChoice}
                  onChange={(e) => setCustomChoice(e.target.value)}
                  onSubmit={() => {
                    if (customChoice.trim().length < 3) return;
                    handleChoice(customChoice);
                    setCustomChoice("");
                  }}
                  disabled={textLoading}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}