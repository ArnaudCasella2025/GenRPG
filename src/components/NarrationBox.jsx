import React from "react";

export default function NarrationBox({ narration, loading }) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 min-h-[150px] bg-white text-lg leading-relaxed mb-6 whitespace-pre-line">
      {loading ? "⌛ Chargement en cours..." : narration || "👀 En attente de votre décision..."}
    </div>
  );
}