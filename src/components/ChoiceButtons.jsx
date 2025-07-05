import React from "react";

export default function ChoiceButtons({ choices, onSelect }) {
  return (
    <div className="space-y-2 mt-4">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onSelect(choice)}
          className="w-full bg-yellow-200 hover:bg-yellow-300 text-gray-900 font-medium py-2 px-4 rounded-md"
        >
          {choice}
        </button>
      ))}
    </div>
  );
}