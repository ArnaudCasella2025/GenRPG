import React from "react";

export default function ToggleImages({ enabled, onToggle }) {
  return (
    <label className="flex items-center space-x-2 mb-4">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
      <span>Générer les images IA</span>
    </label>
  );
}