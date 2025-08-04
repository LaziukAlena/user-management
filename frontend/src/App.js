import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import UsersTable from './components/UsersTable';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
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
        <AuthForm />
      ) : (
        <UsersTable token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
