export function buildImagePrompt(narration) {
  // On garde juste les 3 premières phrases pour rester concis
  const sentences = narration
    .split(/[\.\?\!]\s*/)
    .filter(s => s.length > 10)
    .slice(0, 3);

  const bullets = sentences.map(s => `- ${s.trim()}`).join("\n");

  return `
Create a highly detailed, cinematic illustration of a fantasy scene.
Visual elements:
${bullets}

Style: realistic, vibrant colors, soft cinematic lighting, concept-art quality.
`.trim();
}