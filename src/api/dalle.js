import { buildImagePrompt } from "../utils/buildImagePrompt";
import { fetchRefinedDescription } from "../utils/refineImageDesc";

const IMAGES_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Génére une illustration DALL·E à partir d'une narration.
 * @param {string} narration - Texte narratif complet généré par GPT-4.
 * @returns {Promise<string>} URL de l'image générée.
 */
export async function fetchSceneImage(narration, onProgress = () => {}) {
  if (!OPENAI_API_KEY) {
    throw new Error("Clé OpenAI manquante.");
  }
   // 1) Refinement de la narration pour le prompt image
  const refined = await fetchRefinedDescription(narration);
  onProgress(50);
  // 2) Construction du prompt à partir du texte enrichi
  const prompt = buildImagePrompt(refined);
  onProgress(75);
  
  const response = await fetch(IMAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Erreur DALL·E:", err);
    throw new Error(`Erreur DALL·E (${response.status})`);
  }

  const { data } = await response.json();
  if (!data || !data[0]?.url) {
    throw new Error("Réponse DALL·E invalide.");
  }
  onProgress(100);
  return data[0].url;
}