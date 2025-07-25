// src/utils/parseResponse.js
export function parseNarrationAndChoices(rawText, { debug = import.meta.env.DEV } = {}) {
  try {
    // On cherche explicitement "Choix:"
    const choixMatch = rawText.match(/Choix\s*:([\s\S]*)/i);
    const narrationPart = choixMatch ? rawText.slice(0, choixMatch.index) : rawText;
    const narration = narrationPart.replace(/^Narration:\s*/i, "").trim();

    let choices = [];
    if (choixMatch) {
      choices = choixMatch[1]
        .split(/\n+/)
        .map(line => line.replace(/^\s*\d+[\.\)\-]\s*/, "").trim())
        .filter(Boolean);
    }

    // Pas d'erreur fatale si pas de choix -> on retournera error = true
    const error = !narration || choices.length === 0 ? new Error("no choices") : null;

    if (debug && error) {
      console.groupCollapsed("⚠️ Parse error");
      console.log("rawText:", rawText);
      console.groupEnd();
    }

    return { narration, choices, error };
  } catch (e) {
    if (debug) {
      console.groupCollapsed("⚠️ Parse error");
      console.error(e);
      console.log("rawText:", rawText);
      console.groupEnd();
    }
    
    return { narration: rawText, choices: [], error: e };
  }
}