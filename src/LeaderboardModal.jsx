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

  // load users from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  // sort desc by points
  const sorted = users.slice().sort((a, b) => (b.points || 0) - (a.points || 0));

  function sendFriendRequest(targetEmail) {
    if (targetEmail === currentUserEmail) {
      alert("You can't friend yourself.");
      return;
    }

    // store request in target's friendRequests_{email}
    const key = `friendRequests_${targetEmail}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    // avoid duplicate requests
    if (arr.includes(currentUserEmail)) {
      alert('Friend request already sent.');
      return;
    }

    arr.push(currentUserEmail);
    localStorage.setItem(key, JSON.stringify(arr));
    alert('Friend request sent.');
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Leaderboard</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✖</button>
        </div>

        <div className="p-4">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="py-2 pl-2 w-12">#</th>
                <th className="py-2">Name</th>
                <th className="py-2">Rank</th>
                <th className="py-2">Streak</th>
                <th className="py-2 w-28">Friend</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((u, idx) => (
                <tr key={u.email} className="hover:bg-gray-50">
                  <td className="py-3 pl-2 align-top">{idx + 1}</td>
                  <td className="py-3">
                    <div className="font-medium">{u.name || u.email}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-3 text-lg font-bold">{getProfileRank(u.points || 0)}</td>
                  <td className="py-3">{u.streak || 0}d</td>
                  <td className="py-3">
                    <button
                      onClick={() => sendFriendRequest(u.email)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 border-t">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}
