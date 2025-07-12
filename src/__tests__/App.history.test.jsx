// src/__tests__/App.history.ui.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

vi.mock('../api/openai', () => ({
  fetchInitialNarration: vi.fn().mockResolvedValue('Intro test\nChoix:\n1. Option A'),
  fetchNarrationFromChoice: vi.fn().mockResolvedValue('Suite test\nChoix:\n1. Option B'),
}));

// On simule fetchSceneImage() pour qu’il renvoie immédiatement null (on ne teste pas l’image ici)
vi.mock('../api/dalle', () => ({
  fetchSceneImage: vi.fn().mockResolvedValue(null),
}));

test('l’historique est rempli après démarrage depuis l’UI', async () => {
  render(<App />);

  // Désactive les images pour aller plus vite
  const toggle = screen.getByLabelText(/générer les images/i);
  if (toggle.checked) await userEvent.click(toggle);

  // Clique sur “Commencer l’aventure”
  const startBtn = screen.getByRole('button', { name: /commencer l’aventure/i });
  await userEvent.click(startBtn);

  // Attends que le loader texte disparaisse
  await screen.findByText(/Erreur de parsing IA/i);

  // Vérifie que l’historique contient au moins 1 entrée
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  expect(history.length).toBeGreaterThan(0);
});