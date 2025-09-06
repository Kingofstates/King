import React, { useState, useEffect } from 'react';

export default function TaskManager({ user, updateUser, pointsPerTask }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [showTasks, setShowTasks] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function toggleTask(id) {
    if (window.confirm('Do you really complete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));

      // ✅ award points using config
      const updatedUser = {
        ...user,
        tasksCompleted: user.tasksCompleted + 1,
        points: user.points + pointsPerTask,
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
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        Tasks
      </button>

      {showTasks && (
        <div
          className="absolute left-0 mt-2 w-80 max-h-96 bg-white shadow-lg rounded-lg p-4 overflow-auto border border-gray-300 z-50"
          onClick={hideDescription}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Your Tasks</h3>
            <button onClick={() => setShowTasks(false)} className="text-gray-500 hover:text-gray-800">✖</button>
          </div>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mb-3 px-2 py-1 border rounded focus:outline-none focus:ring"
          />

          <ul>
            {filteredTasks.length === 0 && <li>No tasks found.</li>}
            {filteredTasks.map(task => (
              <li
                key={task.id}
                className="flex items-center justify-start mb-2 space-x-2 p-2 border rounded hover:bg-gray-100 relative"
                onContextMenu={(e) => showDescription(e, task.description)}
                title={task.description || ''}
              >
                <input
                  type="checkbox"
                  onChange={() => toggleTask(task.id)}
                  className="mr-2 accent-green-600"
                />
                <span>{task.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={addTask}
            className="mt-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
          >
            Add Task
          </button>
        </div>
      )}

      {contextMenu.visible && (
        <div
          className="fixed bg-white border p-2 shadow-md rounded z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <p className="text-sm text-gray-800">{contextMenu.description || 'No description'}</p>
          <button onClick={hideDescription} className="mt-2 text-blue-600 text-sm">Close</button>
        </div>
      )}
    </div>
  );
}
