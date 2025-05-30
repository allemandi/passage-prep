import React, { useState } from 'react';

const authChannel = new BroadcastChannel('auth');

const Login = ({ setIsLoggedIn, setShowError, setErrorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');

      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      authChannel.postMessage({ type: 'LOGIN' });
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto w-full flex flex-col gap-6"
    >
      <label className="flex flex-col">
        <span className="mb-2 font-semibold text-gray-700">Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
          placeholder="Enter your username"
        />
      </label>

      <label className="flex flex-col">
        <span className="mb-2 font-semibold text-gray-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
          placeholder="Enter your password"
        />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>
    </form>
  );
};

export default Login;
