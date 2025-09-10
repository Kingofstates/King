import React from 'react';

export default function ExerciseCard({ ex, index, toggleExercise, removeExercise }) {
  return (
    <div
      key={index}
      onClick={() => toggleExercise(index)}
      className={`glass-card p-4 rounded-lg text-center cursor-pointer transition select-none
        ${ex.completed ? 'opacity-60 line-through border-cyan-400' : 'hover:scale-105'}
      `}
    >
      <div className="text-xl font-bold">{ex.name}</div>
      <div className="text-sm text-gray-300 mt-1">
        Still {ex.count}{' '}
        {ex.name.toLowerCase().includes('run') ? 'km' : ' reps'}
      </div>

      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          removeExercise(ex.name); 
        }}
        className="mt-3 text-xs text-red-400 hover:text-red-300 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
