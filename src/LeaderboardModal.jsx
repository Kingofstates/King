import React from 'react';

function getProfileRank(points) {
  if (points >= 500) return 'S';
  if (points >= 400) return 'A';
  if (points >= 300) return 'B';
  if (points >= 200) return 'C';
  if (points >= 100) return 'D';
  return 'E';
}

export default function LeaderboardModal({ open, onClose, currentUserEmail }) {
  if (!open) return null;

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const sorted = users.slice().sort((a, b) => (b.points || 0) - (a.points || 0));

  function sendFriendRequest(targetEmail) {
    if (targetEmail === currentUserEmail) {
      alert("You can't friend yourself.");
      return;
    }

    const key = `friendRequests_${targetEmail}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    if (arr.includes(currentUserEmail)) {
      alert('Friend request already sent.');
      return;
    }

    arr.push(currentUserEmail);
    localStorage.setItem(key, JSON.stringify(arr));
    alert('Friend request sent.');
  }

  function getRowStyle(u, idx) {
    const isCurrentUser = u.email === currentUserEmail;

    if (isCurrentUser) {
      return 'bg-cyan-900/40 border border-cyan-500 shadow-lg shadow-cyan-500/50';
    }
    if (idx === 0) {
      return 'bg-yellow-900/40 border border-yellow-400 shadow-lg shadow-yellow-400/60'; // gold
    }
    if (idx === 1) {
      return 'bg-gray-700/40 border border-gray-300 shadow-lg shadow-gray-300/60'; // silver
    }
    if (idx === 2) {
      return 'bg-orange-900/40 border border-orange-500 shadow-lg shadow-orange-500/60'; // bronze
    }
    return 'hover:bg-white/10';
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl glass-card rounded-xl shadow-lg overflow-auto border border-cyan-500">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-700">
          <h3 className="text-xl font-bold text-cyan-400">🏆 Leaderboard</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-lg"
          >
            ✖
          </button>
        </div>

        {/* Table */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full table-auto border-collapse text-white">
            <thead>
              <tr className="text-sm text-cyan-300 border-b border-cyan-700">
                <th className="py-2 pl-2 w-12">#</th>
                <th className="py-2">Name</th>
                <th className="py-2">Rank</th>
                <th className="py-2">Streak</th>
                <th className="py-2 w-28">Friend</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((u, idx) => {
                const isCurrentUser = u.email === currentUserEmail;
                return (
                  <tr
                    key={u.email}
                    className={`transition ${getRowStyle(u, idx)}`}
                  >
                    <td className="py-3 pl-2 align-top font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3">
                      <div className="font-medium">
                        {u.name || u.email}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-cyan-400 font-bold">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 text-lg font-bold text-yellow-400">
                      {getProfileRank(u.points || 0)}
                    </td>
                    <td className="py-3 text-cyan-300">{u.streak || 0}d</td>
                    <td className="py-3">
                      {!isCurrentUser && (
                        <button
                          onClick={() => sendFriendRequest(u.email)}
                          className="btn-glow text-sm px-3 py-1"
                        >
                          Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 py-3 border-t border-cyan-700">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
