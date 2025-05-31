import React, { useEffect, useState } from 'react';

const defaultExercises = [
  { name: 'Pushups', frequency: 'Every day', count: 6 },
  { name: 'Running', frequency: 'Every day', count: 6 },
  { name: 'Situps', frequency: 'Every day', count: 6 },
  { name: 'Squats', frequency: 'Every day', count: 6 },
];

const allExercises = [
  'Pushups',
  'Running',
  'Situps',
  'Squats',
  'Plank',
  'Cycling',
  'Jumping Jacks'
];

export default function Exercises({ user, updateUser }) {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('exercises');
    return saved ? JSON.parse(saved) : defaultExercises;
  });

  useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  const completedToday = exercises.every(ex => ex.completed);

  useEffect(() => {
    const now = new Date().toDateString();
    const lastReset = localStorage.getItem('lastReset');
    if (lastReset !== now) {
      const resetExercises = exercises.map(ex => ({ ...ex, completed: false }));
      setExercises(resetExercises);
      localStorage.setItem('lastReset', now);
    }
  }, []);

  function toggleExercise(index) {
    if (exercises[index].completed) return;
    if (!window.confirm(`Mark ${exercises[index].name} as complete?`)) return;

    const newExercises = [...exercises];
    newExercises[index].completed = true;
    newExercises[index].count += 1;
    setExercises(newExercises);

    const completed = newExercises.every(ex => ex.completed);
    if (completed) {
      setTimeout(() => alert('Congratulations! You completed all exercises today!'), 500);
    }

    const newPoints = user.points + 10;
    const oldRank = getProfileRank(user.points);
    const newRank = getProfileRank(newPoints);
    if (newRank !== oldRank) {
      setTimeout(() => alert(`Rank up! You are now rank ${newRank}`), 500);
    }

    updateUser({ ...user, points: newPoints });
  }

  function getProfileRank(points) {
    if (points >= 500) return 'S';
    if (points >= 400) return 'A';
    if (points >= 300) return 'B';
    if (points >= 200) return 'C';
    if (points >= 100) return 'D';
    return 'E';
  }

  function removeExercise(name) {
    setExercises(exercises.filter(ex => ex.name !== name));
  }

  function addExercise(name) {
    if (exercises.find(ex => ex.name === name)) return;
    setExercises([...exercises, { name, frequency: 'Every day', count: 0, completed: false }]);
  }

  const dropdownOptions = allExercises.filter(name => !exercises.some(ex => ex.name === name));

  return (
    <div className="mt-6 px-6">
      <div className="text-center mb-6">
        <img
          src={`/profile-${getProfileRank(user.points)}.png`}
          alt="Profile"
          className="w-20 h-20 rounded-full border-4 border-gray-300 mx-auto"
        />
        <div className="text-xl font-bold mt-2">{user.name}</div>
        <div className="text-sm text-gray-600 mt-1">
          Completed {user.tasksCompleted} tasks, Rank: {getProfileRank(user.points)}
        </div>
        <div className="bg-gray-200 inline-block px-4 py-2 rounded shadow text-sm font-medium text-gray-800 mt-2">
          Points: {user.points}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {exercises.map((ex, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg shadow border text-center cursor-pointer transition select-none ${ex.completed ? 'bg-green-100 line-through' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => toggleExercise(i)}
          >
            <div className="text-lg font-semibold">{ex.name}</div>
            <div className="text-sm text-gray-600">Still {ex.count} to go</div>
            <button
              onClick={(e) => { e.stopPropagation(); removeExercise(ex.name); }}
              className="text-xs text-red-500 mt-2 hover:underline"
            >Remove</button>
          </div>
        ))}
      </div>

      {dropdownOptions.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Add Exercise:</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addExercise(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select an exercise</option>
            {dropdownOptions.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
