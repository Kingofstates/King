import React, { useState } from 'react';

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
    if (isSignup && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      name: isSignup ? formData.name : 'Player',
      email: formData.email,
      password: formData.password,
      points: 0,
      tasksCompleted: 0
    };

    onLogin(userData);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 ">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md w-300px">
        <h2 className="text-2xl font-semibold mb-4 text-center text-red-400">
          {isSignup ? 'Sign Up' : 'Login'}
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
              className="w-full border rounded px-3 py-2"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          {isSignup && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          {isSignup ? 'Already have an account?' : 'New to the game?'}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 hover:underline"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
