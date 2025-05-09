import React from 'react';
import { useState } from 'react';
import './App.css'
// import './style.css'
import { useNavigate} from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      const data = await response.json();
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('userId',data.userId);
      alert('Login successful!');
      navigate('/following/')
    } catch (err) {
      setError('Invalid credentials');
    }
  };
  

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f5f5f5' 
    }}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '300px'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {error && (
          <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>
        )}
        <button 
          type="submit"
          style={{
            padding: '0.5rem',
            borderRadius: '5px',
            backgroundColor: '#3f51b5',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => navigate(`/register/`)}
          style={{
            padding: '0.5rem',
            borderRadius: '5px',
            backgroundColor: '#e0e0e0',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
  
}

export default LoginPage;
