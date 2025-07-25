import { loadHistory } from "./storage";
import { GAME_SYSTEM_PROMPT } from "../api/openai";

export function hasSavedSession() {
  const hist = loadHistory();
  return Array.isArray(hist) && hist.length > 0;
}

/**
 * Retourne { sceneHistory, lastEntry } depuis localStorage.
 * lastEntry = la dernière scène (pour restaurer narration/image)
 */
export function loadLastSession() {
  const sceneHistory = loadHistory();
  if (!sceneHistory.length) return null;
  const lastEntry = sceneHistory[sceneHistory.length - 1];
  return { sceneHistory, lastEntry };
}

/**
 * Reconstruit le tableau messages[] pour l'API à partir d’un sceneHistory.
 */
export function rebuildChatHistory(sceneHistory) {
  const out = [{ role: "system", content: GAME_SYSTEM_PROMPT }];

  for (const entry of sceneHistory) {
    // reconstruction du block assistant
    const block = [
      `Narration: ${entry.narration}`,
      "",
      "Choix:",
      ...(Array.isArray(entry.choices) ? entry.choices : []).map(
        (c, i) => `${i + 1}. ${c}`
      )
    ].join("\n");

    out.push({ role: "assistant", content: block });

    // re-injecter le choix du joueur si on l’a stocké
    if (entry.userChoice) {
      out.push({ role: "user", content: entry.userChoice });
    }
  }

  return out;
}