import React from "react";
import Header from "./components/Header";
import ToggleImages from "./components/ToggleImages";
import NarrationBox from "./components/NarrationBox";
import ChoiceButtons from "./components/ChoiceButtons";
import CustomChoice from "./components/CustomChoice";
import LoadingOverlay from "./components/LoadingOverlay";
import ProgressBar from "./components/ProgressBar";
import { useAdventure } from "./hooks/useAdventure";

export default function App() {
  const {
    hasStarted,
    narration,
    choices,
    textLoading,
    imageLoading,
    sceneImage,
    progress,
    imageEnabled,
    setImageEnabled,
    startAdventure,
    handleChoice,
  } = useAdventure();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-gray-100 rounded-2xl shadow-xl p-6 text-gray-800">
        <Header />

        <ToggleImages enabled={imageEnabled} onToggle={() => {
          setImageEnabled(v => !v);
          if (imageLoading) {/* facultatif: kill loader */}
        }}/>

        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
          {imageEnabled && (
            <>
              <LoadingOverlay visible={imageLoading} text="Génération de l’image…" />
              {sceneImage && (
                <img
                  src={sceneImage}
                  alt="Illustration de la scène"
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}
        </div>
        {imageEnabled && imageLoading && (
          <div className="mb-2">
            <ProgressBar progress={progress} />
            <div className="text-sm text-gray-600 mt-1">{progress}%</div>
          </div>
        )}

        <div className="relative mb-4">
          <LoadingOverlay visible={textLoading} text="⏳ Chargement en cours…" />
          <NarrationBox narration={narration} loading={false} />

          {!hasStarted ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={startAdventure}
                disabled={textLoading}
                className={`bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow ${textLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {textLoading ? "Chargement..." : "Commencer l’aventure"}
              </button>
            </div>
          ) : (
            !textLoading && (
              <div className="mt-4 space-y-2">
                <ChoiceButtons choices={choices} onSelect={handleChoice} isDisabled={textLoading} />
                <CustomChoice
                  onSubmit={(val) => {
                    if (val.trim().length < 3) return;
                    handleChoice(val);
                  }}
                  disabled={textLoading}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}