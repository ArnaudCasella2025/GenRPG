// src/utils/storage.js

/**
 * Charge l’historique depuis localStorage.
 * Renvoie un tableau vide si rien n’est stocké ou en cas d’erreur.
 */
export function loadHistory() {
  try {
    const json = localStorage.getItem("history");
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.warn("Échec loadHistory :", err);
    return [];
  }
}

/**
 * Sauvegarde l’historique dans localStorage.
 */
export function saveHistory(history) {
  try {
    localStorage.setItem("history", JSON.stringify(history));
  } catch (err) {
    console.warn("Échec saveHistory :", err);
  }
}