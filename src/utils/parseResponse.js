export function parseNarrationAndChoices(rawText) {
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

    if (!narration || choices.length < 2) throw new Error("Format inattendu");

    return { narration, choices };
  } catch {
    return {
      narration: "⚠️ Erreur de parsing IA.",
      choices: []
    };
  }
}