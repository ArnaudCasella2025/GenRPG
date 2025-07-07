// src/components/ProgressBar.jsx
import React from "react";

/**
 * @param {{ progress: number }} props
 */
export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        className="bg-yellow-400 h-full transition-width duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}