const API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Appelle GPT pour générer la première narration et les choix d'intro
 */
export async function fetchInitialNarration() {
  const messages = [
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
  ];

  return await fetchFromOpenAI(messages);
}

/**
 * Appelle GPT pour continuer l'histoire selon le choix du joueur
 * @param {Array} messages - Historique des messages (system + user)
 */
export async function fetchNarrationFromChoice(messages) {
  return await fetchFromOpenAI(messages);
}

/**
 * Fonction générique pour appeler l'API OpenAI avec un historique donné
 */
async function fetchFromOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error("Clé API OpenAI manquante.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error("Réponse IA invalide.");
  }

  return data.choices[0].message.content;
}