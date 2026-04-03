import { useState } from 'react';
import api from '../services/api';
import { formStyles, buttonStyles, pageStyles } from '../styles/common';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password: password.trim()
      });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const styles = { ...formStyles, ...buttonStyles, ...pageStyles };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <h2 style={loginStyles.title}>Heavy Transport</h2>
        <p style={loginStyles.subtitle}>Sistema de Gestión</p>
        {error && <p style={{ color: '#d32f2f', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={loginStyles.button} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const loginStyles = {
  container: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  card: {
    background: 'white', padding: '2rem',
    borderRadius: '8px', width: '320px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title:    { margin: 0, fontSize: '1.5rem', color: '#1a1a2e' },
  subtitle: { color: '#666', marginBottom: '1.5rem', marginTop: '0.25rem' },
  button: {
    width: '100%', padding: '0.75rem',
    backgroundColor: '#1a1a2e', color: 'white',
    border: 'none', borderRadius: '4px',
    fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
  }
};

export default Login;