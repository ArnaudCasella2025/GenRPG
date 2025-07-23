// src/components/CustomChoice.jsx
import React, { useState } from "react";

export default function CustomChoice({ onSubmit, disabled }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const v = (value || "").trim();
    if (v.length < 3) return;
    onSubmit(v);
    setValue("");
  };

  return (
    <div className="mt-4">
      <input
        className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        type="text"
        placeholder="Écrire votre propre choix…"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow transition ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleSubmit}
        disabled={disabled}
      >
        Valider mon choix
      </button>
    </div>
  );
}