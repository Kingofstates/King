import React, { useEffect, useState } from 'react';
import TaskManager from './TaskManager';
import ExerciseCard from './ExerciseCard';
import MusicPlayer from './MusicPlayer';
import LeaderboardModal from './LeaderboardModal';

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

function getProfileRank(points) {
  if (points >= 500) return 'S';
  if (points >= 400) return 'A';
  if (points >= 300) return 'B';
  if (points >= 200) return 'C';
  if (points >= 100) return 'D';
  return 'E';
}

export default function Dashboard({ user, updateUser, onLogout }) {
  // per-user keys (if you later change to per-user storage, use these)
  const userKeyExercises = `exercises_${user.email}`;
  const userKeyTasks = `tasks_${user.email}`;

  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem(userKeyExercises);
    return saved
      ? JSON.parse(saved)
      : defaultExercises.map(ex => ({ ...ex, count: user.startCount || 1, completed: false }));
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]); // emails who requested
  const [friendsList, setFriendsList] = useState(() => user.friends || []); // emails
  const [showFriendsBox, setShowFriendsBox] = useState(true);

  // clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // persist exercises per-user
  useEffect(() => {
    localStorage.setItem(userKeyExercises, JSON.stringify(exercises));
  }, [exercises]);

  // load pending requests on mount
  useEffect(() => {
    const key = `friendRequests_${user.email}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    setPendingRequests(arr);
    if (arr.length > 0) setShowRequestsModal(true);
  }, [user.email]);

  // ensure user's friends in memory
  useEffect(() => {
    setFriendsList(user.friends || []);
  }, [user.friends]);

  // daily reset + increase
  useEffect(() => {
    const now = new Date().toDateString();
    const lastReset = localStorage.getItem('lastReset');
    if (lastReset !== now) {
      const allDoneYesterday = exercises.every(ex => ex.completed);
      const newStreak = allDoneYesterday ? (user.streak || 0) : 0;

      const increased = exercises.map(ex => ({ ...ex, completed: false, count: (ex.count || 0) + 1 }));
      setExercises(increased);
      localStorage.setItem(userKeyExercises, JSON.stringify(increased));
      localStorage.setItem('lastReset', now);

      const updatedUser = { ...user, streak: newStreak };
      updateUser(updatedUser);
      persistUser(updatedUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  function persistUser(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(u => (u.email === updatedUser.email ? updatedUser : u));
    localStorage.setItem('users', JSON.stringify(users));
  }

  function toggleExercise(index) {
    if (exercises[index].completed) return;
    if (!window.confirm(`Mark ${exercises[index].name} as complete?`)) return;

    const newExercises = [...exercises];
    newExercises[index].completed = true;
    setExercises(newExercises);

    const newPoints = (user.points || 0) + POINTS_CONFIG.exerciseComplete;
    const completedAll = newExercises.every(ex => ex.completed);

    if (completedAll) {
      // completed all today => increment streak
      const updatedUser = { ...user, points: newPoints, streak: (user.streak || 0) + 1 };
      updateUser(updatedUser);
      persistUser(updatedUser);
      alert('Congratulations! You completed all exercises today!');
    } else {
      const updatedUser = { ...user, points: newPoints };
      updateUser(updatedUser);
      persistUser(updatedUser);
    }
  }

  function removeExercise(name) {
    setExercises(exercises.filter(ex => ex.name !== name));
  }

  function addExercise(name) {
    if (exercises.find(ex => ex.name === name)) return;
    const added = [...exercises, { name, frequency: 'Every day', count: user.startCount || 1, completed: false }];
    setExercises(added);
  }

  // --- Friend requests handling ---
  function acceptRequest(requesterEmail) {
    // add to current user's friends
    const myFriends = Array.from(new Set([...(user.friends || []), requesterEmail]));
    const updatedMe = { ...user, friends: myFriends };
    updateUser(updatedMe);
    persistUser(updatedMe);
    setFriendsList(myFriends);

    // add current user to requester's friends
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.map(u => {
      if (u.email === requesterEmail) {
        const theirFriends = Array.from(new Set([...(u.friends || []), user.email]));
        return { ...u, friends: theirFriends };
      }
      return u;
    });
    localStorage.setItem('users', JSON.stringify(users));

    // remove request
    const key = `friendRequests_${user.email}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(e => e !== requesterEmail);
    localStorage.setItem(key, JSON.stringify(arr));
    setPendingRequests(arr);
    setShowRequestsModal(arr.length > 0);
  }

  function rejectRequest(requesterEmail) {
    const key = `friendRequests_${user.email}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(e => e !== requesterEmail);
    localStorage.setItem(key, JSON.stringify(arr));
    setPendingRequests(arr);
    setShowRequestsModal(arr.length > 0);
  }

  // utility to compute leaderboard position for an email
  function getLeaderboardPosition(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const sorted = users.slice().sort((a, b) => (b.points || 0) - (a.points || 0));
    const idx = sorted.findIndex(u => u.email === email);
    return idx >= 0 ? idx + 1 : '-';
  }

  // get friend display data
  function friendData(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const u = users.find(x => x.email === email);
    if (!u) return null;
    return {
      name: u.name || u.email,
      rank: getProfileRank(u.points || 0),
      streak: u.streak || 0,
      position: getLeaderboardPosition(u.email),
    };
  }

  const rank = getProfileRank(user.points || 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-200 p-3 flex justify-between items-center mb-4 w-full relative">
        <TaskManager user={user} updateUser={updateUser} pointsPerTask={POINTS_CONFIG.taskComplete} />
        <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">Flow-State</h1>
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

      {/* Profile & top info */}
      <div className="flex justify-center items-center mt-6 relative space-x-4 px-6">
        <div className="bg-gray-200 px-4 py-2 rounded shadow text-sm font-medium text-gray-800 w-28 text-center">
          Points: {user.points || 0}
        </div>

        <div className="flex flex-col items-center">
          <img
            src={`/profile-${rank}.png`}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-gray-300"
          />
          <div className="text-xl font-bold mt-2">{user.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            Completed {user.tasksCompleted || 0} tasks, Rank: {rank}
          </div>
        </div>

        <div className="bg-gray-200 px-4 py-2 rounded shadow text-sm font-medium text-gray-800 w-28 text-center">
          Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Streak & Rank boxes */}
      <div className="mt-6 px-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="p-6 rounded-lg shadow bg-yellow-100 text-center">
          <div className="text-2xl font-bold text-yellow-800">🔥 Streak</div>
          <div className="text-4xl font-extrabold text-yellow-900 mt-2">
            {user.streak || 0} days
          </div>
        </div>

        <div className="p-6 rounded-lg shadow bg-purple-100 text-center">
          <div className="text-2xl font-bold text-purple-800">🏆 Rank</div>
          <div className="text-5xl font-extrabold text-purple-900 mt-2">
            {rank}
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="mt-6 px-6 flex-1">
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

        {/* Add exercise dropdown */}
        {allExercises.filter(n => !exercises.some(e => e.name === n)).length > 0 && (
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Add Exercise:</label>
            <select
              onChange={(e) => { if (e.target.value) { addExercise(e.target.value); e.target.value = ''; } }}
              className="w-full border rounded px-3 py-3"
            >
              <option value="">Select an exercise</option>
              {allExercises.filter(n => !exercises.some(e => e.name === n)).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Friends box (below add exercise) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold">Friends</h4>
            <button className="text-sm text-blue-600" onClick={() => setShowFriendsBox(!showFriendsBox)}>
              {showFriendsBox ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFriendsBox && (
            <div className="grid gap-3">
              {friendsList.length === 0 && (
                <div className="p-3 border rounded text-sm text-gray-600">No friends yet. Add from Leaderboard.</div>
              )}

              {friendsList.map(email => {
                const fd = friendData(email);
                if (!fd) return null;
                return (
                  <div key={email} className="p-3 rounded shadow-sm border flex items-center justify-between">
                    <div>
                      <div className="font-medium">{fd.name}</div>
                      <div className="text-xs text-gray-500">Rank {fd.rank} • Streak {fd.streak}d</div>
                    </div>
                    <div className="text-sm text-gray-600">#{fd.position}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard button at bottom + footer */}
      <div className="p-4 mt-6 bg-white">
        <div className="flex justify-center">
          <button
            onClick={() => setLeaderOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-5 py-2 rounded-lg shadow-lg hover:scale-105 transition"
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto relative bg-white">
        <div className="flex justify-between items-end w-full px-6 pb-4">
          {/* Left Instagram box */}
          <a
            href="https://instagram.com/king_of_states_1119"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-r-2xl shadow hover:scale-105 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zM12 7.5A4.5 4.5 0 1016.5 12 4.505 4.505 0 0012 7.5zm6-2a1.25 1.25 0 11-1.25 1.25A1.251 1.251 0 0118 5.5z"></path>
            </svg>
            <span className="text-sm font-medium">king_of_states_1119</span>
          </a>

          {/* Right YouTube box */}
          <a
            href="https://www.youtube.com/@kingtech1120"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-l-2xl shadow hover:scale-105 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.7.6 9.4.6 9.4.6s7.7 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"></path>
            </svg>
            <span className="text-sm font-medium">King Tech 1120</span>
          </a>
        </div>
      </footer>


      {/* Leaderboard modal */}
      <LeaderboardModal open={leaderOpen} onClose={() => setLeaderOpen(false)} currentUserEmail={user.email} />

      {/* Friend requests modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Friend Requests</h3>
              <button onClick={() => setShowRequestsModal(false)} className="text-gray-600 hover:text-gray-800">✖</button>
            </div>

            <div className="p-4">
              {pendingRequests.length === 0 && <div className="py-6 text-center text-gray-500">No requests</div>}

              {pendingRequests.map(req => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const requester = users.find(u => u.email === req);
                return (
                  <div key={req} className="flex items-center justify-between border-b py-3">
                    <div>
                      <div className="font-medium">{requester?.name || req}</div>
                      <div className="text-xs text-gray-500">{req}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req)} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                      <button onClick={() => rejectRequest(req)} className="px-3 py-1 bg-gray-100 rounded">Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 px-4 py-3 border-t">
              <button onClick={() => setShowRequestsModal(false)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
