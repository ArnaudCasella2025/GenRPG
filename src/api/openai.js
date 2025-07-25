const API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEBUG_API = import.meta.env.DEV;


export const GAME_SYSTEM_PROMPT = `
Tu es un maître du jeu dans un jeu de rôle textuel. À chaque tour, tu dois raconter la suite de l'aventure de manière immersive, puis proposer exactement 3 choix d'actions possibles.

Respecte strictement ce format :

Narration: [ta narration ici, en 2 à 5 phrases]

Choix:
1. [Premier choix]
2. [Deuxième choix]
3. [Troisième choix]

N’inclus rien d’autre dans ta réponse. Ne répète pas les règles. Commence directement par : Narration:`;

/**
 * Appelle GPT pour générer la première narration et les choix d'intro
 */
export async function fetchInitialNarration() {
  return await fetchFromOpenAI([
    { role: "system", content: GAME_SYSTEM_PROMPT }
  ]);
}

export async function regenerateChoicesFromNarration(narration) {
  const messages = [
    {
      role: "system",
      content: `Tu renvoies STRICTEMENT un JSON valide de la forme:
{"choices":["...","...","..."]}
Aucune autre phrase, pas de backticks.`
    },
    {
      role: "user",
      content: `À partir de ce texte:

"""${narration}"""

Propose EXACTEMENT 3 choix d'action plausibles, courts (<= 90 caractères).`
    }
  ];

  const txt = await fetchFromOpenAI(messages);
  try {
    const parsed = JSON.parse(txt);
    if (Array.isArray(parsed.choices)) return parsed.choices;
  } catch (_) {
    // fallback minimal si l'IA ne renvoie pas du JSON strict
  }
  return ["Continuer", "Observer les environs", "Revenir sur ses pas"];
}

/**
 * Appelle GPT pour continuer l'histoire selon le choix du joueur
 * @param {Array} messages - Historique des messages (system + user)
 */
export async function fetchNarrationFromChoice(messages) {
  const full = [
    { role: "system", content: GAME_SYSTEM_PROMPT },
    ...messages
  ];
  return await fetchFromOpenAI(full);
}

// Ajout du wrapper pour fetchRefinedDescription
export async function fetchRefinedDescription(rawText) {
  return await refineImageDescription(rawText);
}

/**
 * Fonction générique pour appeler l'API OpenAI avec un historique donné
 */
export async function fetchFromOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error("Clé API OpenAI manquante.");
  }

  const body = {
     model: "gpt-4o",
     messages,
     temperature: 0.8
   };

   if (DEBUG_API) {
     console.groupCollapsed("🛰️ OpenAI REQUEST");
     console.log("URL:", API_URL);
     console.log("Body:", body);
     console.groupEnd();
   }

   const response = await fetch(API_URL, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${OPENAI_API_KEY}`
     },
     body: JSON.stringify(body)
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