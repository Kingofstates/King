import React, { useEffect, useState } from 'react';
import TaskManager from './TaskManager';
import ExerciseCard from './ExerciseCard';
import MusicPlayer from './MusicPlayer';

// ✅ Configurable rewards
const POINTS_CONFIG = {
  exerciseComplete: 10,
  taskComplete: 5,
};

const defaultExercises = [
  { name: 'Pushups', frequency: 'Every day' },
  { name: 'Running', frequency: 'Every day' },
  { name: 'Situps', frequency: 'Every day' },
  { name: 'Squats', frequency: 'Every day' },
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

export default function Dashboard({ user, updateUser, onLogout }) {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('exercises');
    return saved
      ? JSON.parse(saved)
      : defaultExercises.map(ex => ({ ...ex, count: user.startCount, completed: false }));
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // auto update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // save exercises to localStorage
  useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  // reset exercises daily and increase count
  useEffect(() => {
    const now = new Date().toDateString();
    const lastReset = localStorage.getItem('lastReset');

    if (lastReset !== now) {
      const increasedExercises = exercises.map(ex => ({
        ...ex,
        completed: false,
        count: ex.count + 1
      }));

      setExercises(increasedExercises);
      localStorage.setItem('exercises', JSON.stringify(increasedExercises));
      localStorage.setItem('lastReset', now);
    }
  }, []);

  function toggleExercise(index) {
    if (exercises[index].completed) return;
    if (!window.confirm(`Mark ${exercises[index].name} as complete?`)) return;

    const newExercises = [...exercises];
    newExercises[index].completed = true;
    setExercises(newExercises);

    const completed = newExercises.every(ex => ex.completed);
    if (completed) {
      setTimeout(() => alert('Congratulations! You completed all exercises today!'), 500);
    }

    // ✅ use config for points
    const newPoints = user.points + POINTS_CONFIG.exerciseComplete;
    const oldRank = getProfileRank(user.points);
    const newRank = getProfileRank(newPoints);
    if (newRank !== oldRank) {
      setTimeout(() => alert(`Rank up! You are now rank ${newRank}`), 500);
    }

    const updatedUser = { ...user, points: newPoints };
    updateUser(updatedUser);
    persistUser(updatedUser);
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
    setExercises([...exercises, { name, frequency: 'Every day', count: user.startCount, completed: false }]);
  }

  const dropdownOptions = allExercises.filter(name => !exercises.some(ex => ex.name === name));
  const rank = getProfileRank(user.points);

  function persistUser(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(u => (u.email === updatedUser.email ? updatedUser : u));
    localStorage.setItem('users', JSON.stringify(users));
  }

  return (
    <div className="h-screen overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-200 p-3 flex justify-between items-center mb-4 w-full">
        <TaskManager user={user} updateUser={updateUser} pointsPerTask={POINTS_CONFIG.taskComplete} />
        <h1 className="text-3xl font-bold">Flow-State</h1>
        <div className="flex items-center space-x-2">
          <MusicPlayer />
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile + Info */}
      <div className="flex justify-center items-center mt-6 relative space-x-4">
        <div className="bg-gray-200 px-4 py-2 rounded shadow text-sm font-medium text-gray-800 w-28 text-center">
          Points: {user.points}
        </div>

        <div className="flex flex-col items-center">
          <img
            src={`/profile-${rank}.png`}
            alt="Profile"
            className="w-30 h-30 rounded-full border-4 border-gray-300"
          />
          <div className="text-xl font-bold mt-2">{user.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            Completed {user.tasksCompleted} tasks, Rank: {rank}
          </div>
        </div>

        <div className="bg-gray-200 px-4 py-2 rounded shadow text-sm font-medium text-gray-800 w-28 text-center">
          Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Exercises */}
      <div className="mt-6 px-6">
        <div className="grid gap-4 mb-4 sm:grid-cols-1 md:grid-cols-2">
          {exercises.map((ex, i) => (
            <ExerciseCard
              key={i}
              ex={ex}
              index={i}
              toggleExercise={toggleExercise}
              removeExercise={removeExercise}
            />
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
              className="w-full border rounded px-3 py-3"
            >
              <option value="">Select an exercise</option>
              {dropdownOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
