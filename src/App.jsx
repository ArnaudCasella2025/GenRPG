import React, { useState, useEffect } from "react";
import ToggleImages from "./components/ToggleImages";
import Header from "./components/Header";
import NarrationBox from "./components/NarrationBox";
import ChoiceButtons from "./components/ChoiceButtons";
import CustomChoice from "./components/CustomChoice";
import LoadingOverlay from "./components/LoadingOverlay";
import ProgressBar from "./components/ProgressBar";
import { parseNarrationAndChoices } from "./utils/parseResponse";
import { fetchInitialNarration, fetchNarrationFromChoice } from "./api/openai";
import { fetchSceneImage } from "./api/dalle";
import { loadHistory, saveHistory } from "./utils/storage";

export default function App() {
  const [hasStarted, setHasStarted]       = useState(false);
  const [narration, setNarration]         = useState("");
  const [choices, setChoices]             = useState([]);
  const [customChoice, setCustomChoice]   = useState("");
  const [textLoading, setTextLoading]     = useState(false);
  const [imageLoading, setImageLoading]   = useState(false);
  const [sceneImage, setSceneImage]       = useState(null);
  const [progress, setProgress]         = useState(0);
  //const [history, setHistory]             = useState([{ role: "system", content: "" }]);
  // Historique de conversation pour OpenAI (role/content)
  const [chatHistory, setChatHistory] = useState([
    { role: "system", content: "" }
  ]);
  // Historique de scène pour l’UI (narration + imageUrl + timestamp)
  const [sceneHistory, setSceneHistory] = useState(() => loadHistory());
  // Toggle global pour la génération d'images IA
  const [imageEnabled, setImageEnabled] = useState(() => {
    const stored = localStorage.getItem("imageEnabled");
    return stored !== null ? JSON.parse(stored) : true;
  });
  useEffect(() => {
    localStorage.setItem("imageEnabled", JSON.stringify(imageEnabled));
  }, [imageEnabled]);

  const startAdventure = async () => {
    // 1) On met les deux overlays en route
    setTextLoading(true);
    setImageLoading(true);
    setProgress(0);                // étape 0%

    // 1) Génération du texte d’intro (toujours exécutée)
    let rawText = "";
    let newNarr = "";
    let newCh = [];
    let imageUrl = null;
    try {
      rawText = await fetchInitialNarration();
      setProgress(25);
      
      // On parse et on récupère narration + choix
      const parsed = parseNarrationAndChoices(rawText);
      newNarr = parsed.narration;
      newCh = parsed.choices;

      setNarration(newNarr);
      setChoices(newCh);
      setHasStarted(true);

    } catch (e) {
      console.error("Erreur intro :", e);
    } finally {
      setTextLoading(false);
      setProgress(25);
    }

    // 2) Génération de l’image (uniquement si activé)
    if (imageEnabled) {
      try {
        const url = await fetchSceneImage(rawText, pct => setProgress(pct));
        imageUrl = url;
        setSceneImage(url);
      } catch (e) {
        console.error("Erreur image intro :", e);
      }
    }

    const entryIntro = {
      narration: newNarr,
      imageUrl,
      timestamp: Date.now()
    };
    setSceneHistory(prev => {
      const next = [...prev, entryIntro];
      saveHistory(next);
      return next;
    });

   // 4️⃣ On alimente aussi chatHistory pour les prochains appels
   setChatHistory([
     ...chatHistory,
     { role: "assistant", content: rawText }
   ]);

    // On arrête toujours le loader image
    setImageLoading(false);
  };

  const handleChoice = async (choice) => {
    // 1) Overlay texte + image activés
    setTextLoading(true);
    setImageLoading(true);
    setProgress(0); 

     // 1) Génération du nouveau texte (toujours exécutée)
    let rawText = "";
    let newNarr = "";
    let newCh = [];
    let imageUrl = null;

    try {
      const userMessage = { role: "user", content: choice };
      const thread = [...chatHistory, userMessage];
      rawText = await fetchNarrationFromChoice(thread);
      // On parse et on récupère narration + choix
      const parsed = parseNarrationAndChoices(rawText);
      newNarr = parsed.narration;
      newCh = parsed.choices;

      setNarration(newNarr);
      setChoices(newCh);
      setChatHistory(prev => [...prev, userMessage, { role: "assistant", content: rawText }]);
    } catch (e) {
      console.error("Erreur handleChoice :", e);
    } finally {
      setTextLoading(false);
      setProgress(25);
    }

    // 2) Génération de l’image (uniquement si activé)
    if (imageEnabled) {
      try {
        const url = await fetchSceneImage(rawText, pct => setProgress(pct));
        imageUrl = url;
        setSceneImage(url);
      } catch (e) {
        console.error("Erreur image scène :", e);
      }
    }

    const entry = {
      narration: newNarr,
      imageUrl,
      timestamp: Date.now()
    };
    setSceneHistory(prev => {
        const next = [...prev, entry];
        saveHistory(next);
        return next;
      });

    // On arrête toujours le loader image
    setImageLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-gray-100 rounded-2xl shadow-xl p-6 text-gray-800">
        <Header />
        {/* Toggle génération d’images IA */}
        <ToggleImages
          enabled={imageEnabled}
          onToggle={() => {
            setImageEnabled(v => !v);
            // si on coupe les images, on arrête aussi tout chargement en cours
            if (imageLoading) setImageLoading(false);
          }}
        />
        {/* Scène : image + overlay */}
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
          {imageEnabled && (
            <>
              <LoadingOverlay visible={imageLoading} text="Génération de l’image…" />
              {sceneImage && (
                <img
                  src={sceneImage}
                  alt="Illustration de la scène"
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}
        </div>
        {imageLoading && imageEnabled && (
          <div className="mb-2">
            <ProgressBar progress={progress} />
            <div className="text-sm text-gray-600 mt-1">{progress}%</div>
          </div>
        )}

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