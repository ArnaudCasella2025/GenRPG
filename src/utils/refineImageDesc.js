import { fetchFromOpenAI } from "../api/openai";

/**
 * Réécrit une narration en un paragraphe descriptif riche pour l'image.
 * @param {string} rawNarration - Texte narratif brut
 * @returns {Promise<string>} Texte reformulé pour DALL·E
 */
export async function fetchRefinedDescription(rawNarration) {
  const systemMessage = {
    role: "system",
    content: `Tu es un assistant spécialisé dans la reformulation de descriptions visuelles pour génération d'images. 
Mets en scene l'action dans ce texte en un court paragraphe descriptif, en insistant sur les couleurs, textures et objets clés à inclure dans une illustration.`
  };
  const userMessage = {
    role: "user",
    content: rawNarration
  };

  // Appel GPT-4 pour reformuler
  try {
    const refined = await fetchFromOpenAI([systemMessage, userMessage]);
    return refined.trim();
  } catch (err) {
    console.warn("Erreur refinement description, fallback to raw narration:", err);
    return rawNarration;
  }
}

