import React from 'react';

export default function ExerciseCard({ ex, index, toggleExercise, removeExercise }) {
  return (
    <div
      key={index}
      className={`p-4 rounded-lg shadow border text-center cursor-pointer transition select-none ${
        ex.completed ? 'bg-green-100 line-through' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={() => toggleExercise(index)}
    >
      <div className="text-lg font-semibold">{ex.name}</div>
      <div className="text-sm text-gray-600">
        Still {ex.count} {ex.name.toLowerCase().includes('run') ? 'km' : ''} to go
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); removeExercise(ex.name); }}
        className="text-xs text-red-500 mt-2 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
