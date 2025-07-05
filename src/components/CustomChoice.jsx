import React from "react";

export default function CustomChoice({ 
  value, 
  onChange, 
  onSubmit, 
  disabled 
}) {
  return (
    <div className="mt-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Écrire votre propre choix…"
        className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        disabled={disabled}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || value.trim().length < 3}
        className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow transition 
          ${disabled || value.trim().length < 3 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        Valider mon choix
      </button>
    </div>
  );
}