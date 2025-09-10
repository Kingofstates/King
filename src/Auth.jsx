import React, { useState } from 'react';

const ADMIN_EMAIL = "admin@flowstate.com";
const ADMIN_PASS = "king@1120";

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // ✅ Admin bypass before checking localStorage
    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASS) {
      onLogin({
        name: "King of states",
        email: formData.email,
        isAdmin: true,
      });
      return;
    }

    // get users from localStorage (our fake DB for now)
    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (isSignup) {
      // --- SIGN UP ---
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (users.find(u => u.email === formData.email)) {
        alert("Email already registered. Please login.");
        return;
      }

      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        points: 0,
        tasksCompleted: 0,
        startCount: 0,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      onLogin(newUser);

    } else {
      // --- LOGIN ---
      const user = users.find(u => u.email === formData.email);
      if (!user) {
        alert("No account found. Please register.");
        setIsSignup(true);
        return;
      }

      if (user.password !== formData.password) {
        alert("Incorrect password");
        return;
      }

      onLogin(user);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isSignup ? 'Create Account' : 'Login'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-black/40 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-black/40 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-black/40 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          {isSignup && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-black/40 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          )}

          <button
            type="submit"
            className="w-full btn-glow"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyan-400 hover:underline"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
