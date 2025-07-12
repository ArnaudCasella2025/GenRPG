import { loadHistory, saveHistory } from "../utils/storage";

beforeEach(() => localStorage.clear());

test("loadHistory() renvoie [] si vide", () => {
  expect(loadHistory()).toEqual([]);
});

test("saveHistory() persiste et loadHistory() recharge", () => {
  const sample = [{ narration: "Test", imageUrl: null, timestamp: 1 }];
  saveHistory(sample);
  expect(loadHistory()).toEqual(sample);
});