import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import UsersTable from './components/UsersTable';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (email, password, setError) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setError('');
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
  };

  return (
    <div
      style={{
        backgroundImage: `url('https://img.freepik.com/free-vector/modern-abstract-background_1048-1003.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!token ? (
        <AuthForm
          onLogin={handleLogin}
          isRegistering={isRegistering}
          toggleForm={toggleForm}
        />
      ) : (
        <UsersTable token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
