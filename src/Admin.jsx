import React, { useEffect, useState } from 'react';
import TaskManager from './TaskManager';
import MusicPlayer from './MusicPlayer';

const ADMIN_EMAIL = 'admin@flowstate.com';
const ADMIN_PASS = 'king@1120';

function getProfileRank(points) {
  if (points >= 500) return 'S';
  if (points >= 400) return 'A';
  if (points >= 300) return 'B';
  if (points >= 200) return 'C';
  if (points >= 100) return 'D';
  return 'E';
}

export default function Admin({ user, onLogout, updateUser }) {
  const [authOk, setAuthOk] = useState(false);
  const [pass, setPass] = useState('');
  const [globalExercises, setGlobalExercises] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({ exerciseComplete: 10, taskComplete: 5 });
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);

  useEffect(() => {
    const g = JSON.parse(localStorage.getItem('exercises_global') || '[]');
    setGlobalExercises(g);
    const u = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(u);
    const a = JSON.parse(localStorage.getItem('announcements') || '[]');
    setAnnouncements(a);
    const pc = JSON.parse(localStorage.getItem('points_config') || '{}');
    if (pc && pc.exerciseComplete !== undefined) setPointsConfig(pc);
  }, []);

  useEffect(() => {
    localStorage.setItem('exercises_global', JSON.stringify(globalExercises));
  }, [globalExercises]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('points_config', JSON.stringify(pointsConfig));
  }, [pointsConfig]);

  function handleAuth(e) {
    e.preventDefault();
    if ((user && user.email === ADMIN_EMAIL && pass === ADMIN_PASS) || (user == null && ADMIN_EMAIL === ADMIN_EMAIL && pass === ADMIN_PASS)) {
      setAuthOk(true);
    } else {
      alert('Admin credentials incorrect.');
    }
  }

  function addExerciseFlow() {
    const name = prompt('Exercise name (unique):');
    if (!name) return;
    if (globalExercises.find(ex => ex.name === name)) return alert('Exercise already exists.');
    const base = parseInt(prompt('Base points for completing at count 1 (number):', '1') || '1', 10);
    const incrementEvery = parseInt(prompt('Increase extra points every N counts (e.g., 5):', '5') || '5', 10);
    const extraPerIncrement = parseInt(prompt('Extra points added per increment (e.g., 1):', '1') || '1', 10);
    const maxCount = parseInt(prompt('Max count (e.g., 150):', '150') || '150', 10);
    const ex = { name, basePoints: base, incrementEvery, extraPerIncrement, maxCount };
    setGlobalExercises(prev => [...prev, ex]);
    alert('Exercise added.');
  }

  function deleteExercise(name) {
    if (!window.confirm('Delete exercise "' + name + '" ?')) return;
    setGlobalExercises(prev => prev.filter(e => e.name !== name));
  }

  function saveExerciseEdit(index, field, value) {
    const arr = [...globalExercises];
    arr[index] = { ...arr[index], [field]: value };
    setGlobalExercises(arr);
  }

  function openManageUsers() {
    const u = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(u);
    setShowUsersModal(true);
  }

  function updateUserRow(email, patch) {
    const arr = users.map(u => (u.email === email ? { ...u, ...patch } : u));
    setUsers(arr);
    localStorage.setItem('users', JSON.stringify(arr));
    alert('User updated.');
  }

  function deleteUser(email) {
    if (!window.confirm('Delete user ' + email + ' ?')) return;
    const arr = users.filter(u => u.email !== email);
    setUsers(arr);
    localStorage.setItem('users', JSON.stringify(arr));
    alert('User deleted.');
  }

  function openAnnouncement() {
    setShowAnnouncementModal(true);
  }

  function createAnnouncement(e) {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const link = e.target.link.value.trim();
    const desc = e.target.desc.value.trim();
    const img = selectedFilePreview;
    if (!title) return alert('Title required');
    const item = { id: Date.now(), title, link, desc, img, createdAt: new Date().toISOString() };
    setAnnouncements(prev => [item, ...prev]);
    e.target.reset();
    setSelectedFilePreview(null);
    setShowAnnouncementModal(false);
    alert('Announcement created. It will be visible to users when they open the app.');
  }

  function onFileChange(fi) {
    const file = fi.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedFilePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function setGlobalPointsConfig() {
    const ex = parseInt(prompt('Points awarded for exercise completion (number):', String(pointsConfig.exerciseComplete || 10)) || '10', 10);
    const tk = parseInt(prompt('Points awarded for task completion (number):', String(pointsConfig.taskComplete || 5)) || '5', 10);
    setPointsConfig({ exerciseComplete: ex, taskComplete: tk });
    alert('Points config updated.');
  }

  if (!authOk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
          <div className="text-sm text-gray-600 mb-4">Use admin email and password to enter.</div>
          <form onSubmit={handleAuth} className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Admin Email</label>
              <input defaultValue={ADMIN_EMAIL} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
            </div>
            <div>
              <label className="text-sm block mb-1">Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex justify-between items-center">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enter Admin</button>
              <button type="button" onClick={() => { setPass(''); alert('Admin: ' + ADMIN_PASS); }} className="text-sm text-gray-500">Show hint</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-200 p-3 flex justify-between items-center mb-4 w-full relative">
        <TaskManager user={user} updateUser={updateUser} />
        <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">Flow-State</h1>
        <div className="flex items-center space-x-2">
          <MusicPlayer />
          <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Logout</button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <img src="/king.png" alt="King" className="w-28 h-28 rounded-full border-4 border-gray-300" />
            <div className="mt-3 text-center">
              <div className="text-xl font-bold">King of states</div>
              <div className="text-sm text-gray-500">Rank: —</div>
              <div className="text-sm text-gray-700 mt-2">Points: ∞</div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg shadow bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Exercises (global)</div>
                  <div className="flex gap-2">
                    <button onClick={addExerciseFlow} className="bg-green-600 text-white px-3 py-1 rounded">Add Exercise</button>
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(globalExercises)); alert('Copied JSON'); }} className="bg-gray-100 px-3 py-1 rounded">Export</button>
                  </div>
                </div>

                <div className="space-y-3 max-h-72 overflow-auto">
                  {globalExercises.length === 0 && <div className="text-sm text-gray-500">No global exercises yet.</div>}
                  {globalExercises.map((ex, idx) => (
                    <div key={ex.name} className="p-3 border rounded flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-xs text-gray-500">
                          base: {ex.basePoints} • +{ex.extraPerIncrement} every {ex.incrementEvery} counts • max: {ex.maxCount}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={ex.basePoints}
                          onChange={e => saveExerciseEdit(idx, 'basePoints', parseInt(e.target.value || '0', 10))}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <button onClick={() => deleteExercise(ex.name)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg shadow bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Controls</div>
                </div>

                <div className="space-y-3">
                  <button onClick={openManageUsers} className="w-full bg-indigo-600 text-white px-3 py-2 rounded">Manage Users</button>
                  <button onClick={() => setShowAnnouncementModal(true)} className="w-full bg-yellow-500 text-white px-3 py-2 rounded">New Announcement</button>
                  <button onClick={setGlobalPointsConfig} className="w-full bg-pink-500 text-white px-3 py-2 rounded">Edit Global Points Config</button>
                  <button onClick={() => { localStorage.removeItem('exercises_global'); setGlobalExercises([]); alert('Cleared global exercises'); }} className="w-full bg-gray-100 px-3 py-2 rounded">Clear Global Exercises</button>
                  <button onClick={() => { const u = JSON.parse(localStorage.getItem('users') || '[]'); setUsers(u); alert('Reloaded users'); }} className="w-full bg-gray-100 px-3 py-2 rounded">Reload Users</button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">Announcements</div>
              <div className="space-y-3">
                {announcements.length === 0 && <div className="text-sm text-gray-500">No announcements.</div>}
                {announcements.map(a => (
                  <div key={a.id} className="p-3 border rounded flex items-start gap-3">
                    {a.img && <img src={a.img} className="w-16 h-16 object-cover rounded" alt="ann" />}
                    <div className="flex-1">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.desc}</div>
                      {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Source</a>}
                    </div>
                    <div className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-auto">
        <footer className="relative bg-white">
          <div className="text-center py-2 text-lg font-bold">Flow-State</div>
          <div className="flex justify-between items-end w-full px-6 pb-6">
            <a
              href="https://instagram.com/king_of_states_1119"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-r-2xl shadow hover:scale-105 transition"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zM12 7.5A4.5 4.5 0 1016.5 12 4.505 4.505 0 0012 7.5zm6-2a1.25 1.25 0 11-1.25 1.25A1.251 1.251 0 0118 5.5z"></path></svg>
              <span className="text-sm font-medium">king_of_states_1119</span>
            </a>

            <a
              href="https://www.youtube.com/@kingtech1120"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-l-2xl shadow hover:scale-105 transition"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.7.6 9.4.6 9.4.6s7.7 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"></path></svg>
              <span className="text-sm font-medium">King Tech 1120</span>
            </a>
          </div>
        </footer>
      </div>

      {showUsersModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Manage Users</h3>
              <button onClick={() => setShowUsersModal(false)} className="text-gray-600 hover:text-gray-800">✖</button>
            </div>

            <div className="p-4">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2 pl-2 w-12">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Points</th>
                    <th className="py-2">Streak</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.email} className="hover:bg-gray-50">
                      <td className="py-3 pl-2 align-top">{idx + 1}</td>
                      <td className="py-3">{u.name || u.email}</td>
                      <td className="py-3 text-xs text-gray-600">{u.email}</td>
                      <td className="py-3">
                        <input className="w-24 px-2 py-1 border rounded" type="number" defaultValue={u.points || 0}
                          onBlur={(e) => updateUserRow(u.email, { points: parseInt(e.target.value || '0', 10) })} />
                      </td>
                      <td className="py-3">
                        <input className="w-20 px-2 py-1 border rounded" type="number" defaultValue={u.streak || 0}
                          onBlur={(e) => updateUserRow(u.email, { streak: parseInt(e.target.value || '0', 10) })} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { if (confirm('Reset exercises for this user?')) { updateUserRow(u.email, { exercises: [] }); } }} className="px-2 py-1 bg-gray-100 rounded">Reset</button>
                          <button onClick={() => deleteUser(u.email)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="6" className="py-6 text-center text-gray-500">No users.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 px-4 py-3 border-t">
              <button onClick={() => setShowUsersModal(false)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAnnouncementModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">New Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-gray-600 hover:text-gray-800">✖</button>
            </div>

            <form onSubmit={createAnnouncement} className="p-4 space-y-3">
              <div>
                <label className="text-sm block mb-1">Title</label>
                <input name="title" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Source Link (optional)</label>
                <input name="link" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Description (optional)</label>
                <textarea name="desc" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Image (optional)</label>
                <input type="file" accept="image/*" onChange={onFileChange} />
                {selectedFilePreview && <img src={selectedFilePreview} alt="preview" className="mt-2 w-32 h-24 object-cover rounded" />}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-3 py-1 rounded bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
