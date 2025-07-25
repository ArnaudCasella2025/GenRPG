import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach, describe, it, expect } from "vitest";

// ⚠️ On mock les appels réseau pour ne pas contacter OpenAI pendant ces tests
vi.mock("../api/openai", () => ({
  fetchInitialNarration: vi.fn().mockResolvedValue("Intro mock\nChoix:\n1. Avancer"),
  fetchNarrationFromChoice: vi.fn().mockResolvedValue("Suite mock\nChoix:\n1. Continuer"),
}));
vi.mock("../api/dalle", () => ({
  fetchSceneImage: vi.fn().mockResolvedValue(null),
}));

import App from "../App";

beforeEach(() => {
  // Important : repartir d'un storage propre à chaque test
  localStorage.clear();
});

// ----------------------
// CAS 1 : history présent
// ----------------------
describe("StartScreen avec sauvegarde existante", () => {
  it("affiche le bouton 'Reprendre la dernière partie' et restaure l'état", async () => {
    // 1) Simuler une sauvegarde dans le localStorage
    const fakeHistory = [
      { narration: "Dernière narration sauvegardée", choices: ["Option X"], imageUrl: null, timestamp: Date.now() }
    ];
    localStorage.setItem("history", JSON.stringify(fakeHistory));

    // 2) Render de l'app
    render(<App />);

    // 3) Le modal doit proposer de reprendre
    const resumeBtn = await screen.findByRole("button", { name: /reprendre la dernière partie/i });
    expect(resumeBtn).toBeInTheDocument();

    // 4) Cliquer sur « Reprendre »
    await userEvent.click(resumeBtn);

    // 5) Le modal disparaît
    expect(screen.queryByText(/reprendre la dernière partie/i)).toBeNull();

    // 6) La narration restaurée est visible
    // (on vérifie le texte de la dernière entrée)
    expect(await screen.findByText(/dernière narration sauvegardée/i)).toBeInTheDocument();
  });
});

// ------------------------
// CAS 2 : aucune sauvegarde
// ------------------------
describe("StartScreen sans sauvegarde", () => {
  it("n'affiche pas le modal et propose 'Commencer l’aventure'", async () => {
    // 0) localStorage est vide (grâce à beforeEach)
    render(<App />);

    // 1) Le modal n'existe pas
    expect(screen.queryByText(/reprendre la dernière partie/i)).toBeNull();

    // 2) Le bouton 'Commencer l’aventure' est visible
    const startBtn = screen.getByRole("button", { name: /commencer l’aventure/i });
    expect(startBtn).toBeInTheDocument();
  });
});