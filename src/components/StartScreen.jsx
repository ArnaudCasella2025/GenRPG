import React from "react";

export default function StartScreen({ onResume, onNewGame }) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <h2 className="text-xl font-bold mb-4">Reprendre votre partie ?</h2>
        <p className="text-gray-600 mb-6">
          Une sauvegarde a été trouvée. Voulez-vous la charger ?
        </p>
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
          >
            Reprendre la dernière partie
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold"
          >
            Nouvelle partie
          </button>
        </div>
      </div>
    </div>
  );
}