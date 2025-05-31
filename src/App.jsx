import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} updateUser={setUser} onLogout={handleLogout} />
      )}
    </div>
  );
}
