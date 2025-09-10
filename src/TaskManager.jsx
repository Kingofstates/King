import React, { useState, useEffect } from 'react';

export default function TaskManager({ user, updateUser, pointsPerTask }) {
  // 🔑 unique key for this user's tasks
  const userKey = `tasks_${user.email}`;

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [showTasks, setShowTasks] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // persist tasks per user
  useEffect(() => {
    localStorage.setItem(userKey, JSON.stringify(tasks));
  }, [tasks, userKey]);

  function toggleTask(id) {
    if (window.confirm('Do you really complete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));

      // ✅ award points to this user
      const updatedUser = {
        ...user,
        tasksCompleted: (user.tasksCompleted || 0) + 1,
        points: (user.points || 0) + pointsPerTask,
      };
      updateUser(updatedUser);

      // persist user
      let users = JSON.parse(localStorage.getItem('users')) || [];
      users = users.map(u => (u.email === updatedUser.email ? updatedUser : u));
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  function addTask() {
    const name = prompt('Enter task name (required):');
    if (!name) return alert('Task name is required!');
    const description = prompt('Enter description (optional):');
    setTasks([...tasks, { id: Date.now(), text: name, description: description || '', done: false }]);
  }

  function showDescription(e, description) {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, description });
  }

  function hideDescription() {
    setContextMenu({ visible: false, x: 0, y: 0, description: '' });
  }

  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTasks(!showTasks)}
        className="btn-glow"
      >
        Tasks
      </button>

      {showTasks && (
        <div
          className="absolute left-0 mt-2 w-80 max-h-96 glass-card p-4 overflow-auto z-50"
          onClick={hideDescription}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Your Tasks</h3>
            <button onClick={() => setShowTasks(false)} className="text-gray-400 hover:text-white">✖</button>
          </div>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mb-3 px-2 py-1 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-cyan-500"
          />

          <ul>
            {filteredTasks.length === 0 && <li className="text-gray-400">No tasks found.</li>}
            {filteredTasks.map(task => (
              <li
                key={task.id}
                className="flex items-center justify-start mb-2 space-x-2 p-2 rounded bg-black/30 border border-white/10 hover:bg-black/50 cursor-pointer"
                onContextMenu={(e) => showDescription(e, task.description)}
                title={task.description || ''}
              >
                <input
                  type="checkbox"
                  onChange={() => toggleTask(task.id)}
                  className="mr-2 accent-cyan-400"
                />
                <span>{task.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={addTask}
            className="mt-4 btn-glow"
          >
            Add Task
          </button>
        </div>
      )}

      {contextMenu.visible && (
        <div
          className="fixed glass-card p-2 shadow-md rounded z-50 max-w-xs"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <p className="text-sm">{contextMenu.description || 'No description'}</p>
          <button onClick={hideDescription} className="mt-2 text-cyan-400 text-sm hover:underline">Close</button>
        </div>
      )}
    </div>
  );
}
