import { useState, useEffect } from "react";
import { fetchInitialNarration, fetchNarrationFromChoice } from "../api/openai";
import { fetchSceneImage } from "../api/dalle";
import { parseNarrationAndChoices } from "../utils/parseResponse";
import { loadHistory, saveHistory } from "../utils/storage";

/**
 * runScene : cœur de la génération d'une scène (intro ou choix).
 * @param {object} params
 *  - buildText: (chatHistory) => Promise<string>  (fonction qui retourne le rawText)
 *  - userMessage: {role:'user', content:string} | null
 *  - state: objet regroupant tous les setters/getters nécessaires
 */
async function runScene({ buildText, userMessage = null, state }) {
  const {
    setTextLoading, setImageLoading, setProgress,
    setNarration, setChoices, setHasStarted,
    chatHistory, setChatHistory,
    imageEnabled, setSceneImage,
    setSceneHistory,
  } = state;

  // 1) loaders on
  setTextLoading(true);
  setImageLoading(true);
  setProgress(0);

  // 2) génération texte
  let rawText = "", newNarr = "", newCh = [];
  try {
    // on ajoute le message user si présent
    let currentChat = chatHistory;
    if (userMessage) {
      currentChat = [...chatHistory, userMessage];
      setChatHistory(current => [...current, userMessage]);
    }

    rawText = await buildText(currentChat);
    setProgress(25);

    const parsed = parseNarrationAndChoices(rawText);
    newNarr = parsed.narration;
    newCh = parsed.choices;

    setNarration(newNarr);
    setChoices(newCh);

    if (!userMessage) setHasStarted(true);

    // assistant répond
    setChatHistory(current => [...current, { role: "assistant", content: rawText }]);
  } catch (e) {
    console.error("Erreur génération texte :", e);
  } finally {
    setTextLoading(false);
    setProgress(25);
  }

  // 3) génération image
  let imageUrl = null;
  if (imageEnabled) {
    try {
      const url = await fetchSceneImage(rawText, pct => setProgress(pct));
      imageUrl = url;
      setSceneImage(url);
    } catch (e) {
      console.error("Erreur génération image :", e);
    }
  }
  setImageLoading(false);

  // 4) enregistrement de la scène
  const entry = { narration: newNarr, imageUrl, timestamp: Date.now() };
  setSceneHistory(prev => {
    const next = [...prev, entry];
    saveHistory(next);
    return next;
  });
}

export function useAdventure() {
  // UI state
  const [hasStarted, setHasStarted] = useState(false);
  const [narration, setNarration] = useState("");
  const [choices, setChoices] = useState([]);
  const [textLoading, setTextLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [sceneImage, setSceneImage] = useState(null);
  const [progress, setProgress] = useState(0);

  // Historiques
  const [chatHistory, setChatHistory] = useState([{ role: "system", content: "" }]);
  const [sceneHistory, setSceneHistory] = useState(() => loadHistory());

  // Toggle images
  const [imageEnabled, setImageEnabled] = useState(() => {
    const stored = localStorage.getItem("imageEnabled");
    return stored !== null ? JSON.parse(stored) : true;
  });
  useEffect(() => {
    localStorage.setItem("imageEnabled", JSON.stringify(imageEnabled));
  }, [imageEnabled]);

  // Regrouper ce dont runScene a besoin
  const state = {
    setTextLoading, setImageLoading, setProgress,
    setNarration, setChoices, setHasStarted,
    chatHistory, setChatHistory,
    imageEnabled, setSceneImage,
    setSceneHistory,
  };

  const startAdventure = () =>
    runScene({
      buildText: () => fetchInitialNarration(),
      userMessage: null,
      state
    });

  const handleChoice = choice =>
    runScene({
      buildText: (currentChat) => fetchNarrationFromChoice(currentChat),
      userMessage: { role: "user", content: choice },
      state
    });

  return {
    hasStarted,
    narration,
    choices,
    textLoading,
    imageLoading,
    sceneImage,
    progress,
    sceneHistory,
    imageEnabled,
    setImageEnabled,
    startAdventure,
    handleChoice,
  };
}