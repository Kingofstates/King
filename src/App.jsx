import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Admin from './Admin';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    // if admin email, open admin
    if (userData && userData.email === 'admin@flowstate.com') {
      setUser({ ...userData, isAdmin: true });
      return;
    }
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (user.isAdmin) {
    return <Admin user={user} onLogout={handleLogout} updateUser={setUser} />;
  }

  return <Dashboard user={user} updateUser={setUser} onLogout={handleLogout} />;
}
