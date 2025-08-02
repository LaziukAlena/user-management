import React, { useState } from 'react';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // true — логин, false — регистрация
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const API_URL = import.meta.env.VITE_API_URL || 'https://user-management-production-d5d1.up.railway.app';
    const url = `${API_URL}/api/auth/${isLogin ? 'login' : 'register'}`;

    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }

      if (isLogin) {
        
        localStorage.setItem('token', data.token);
        window.location.href = '/users';
      } else {
        
        alert('Registration successful. You can now log in.');
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-4" style={{ width: 350 }}>
      <h3 className="mb-3">{isLogin ? 'Login' : 'Register'}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-3">
            <label>Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin} 
            />
          </div>
        )}
        <div className="mb-3">
          <label>Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="text-center mt-3">
        <button
          className="btn btn-link"
          onClick={() => {
            setError(null);
            setIsLogin(!isLogin);
          }}
        >
          {isLogin ? 'Create an account' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
}
