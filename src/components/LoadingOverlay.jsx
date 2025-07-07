import React from "react";

/**
 * Affiche un overlay blanc semi-opaque avec un texte centré pendant le chargement.
 * @param {{ visible: boolean, text: string }} props
 */
export default function LoadingOverlay({ visible, text }) {
  return (
    <div
      className={`absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <span className="text-gray-700 font-semibold">{text}</span>
    </div>
  );
}