import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles  from './pages/Vehicles';
import Employees from './pages/Employees';
import Clients   from './pages/Clients';
import Trips     from './pages/Trips';
import Expenses  from './pages/Expenses';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div style={styles.layout}>
        <nav style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Heavy Transport</h3>
          <a style={styles.link} href="/dashboard">Dashboard</a>
          <a style={styles.link} href="/trips">Viajes</a>
          <a style={styles.link} href="/expenses">Gastos</a>
          <a style={styles.link} href="/vehicles">Vehículos</a>
          <a style={styles.link} href="/employees">Empleados</a>
          <a style={styles.link} href="/clients">Clientes</a>
          <button style={styles.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
        </nav>
        <main style={styles.main}>
          <Routes>
            <Route path="/"          element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles"  element={<Vehicles />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/clients"   element={<Clients />} />
            <Route path="/trips"     element={<Trips />} />
            <Route path="/expenses"  element={<Expenses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  layout:      { display: 'flex', height: '100vh' },
  sidebar: {
    width: '200px', backgroundColor: '#1a1a2e',
    display: 'flex', flexDirection: 'column',
    padding: '1.5rem 1rem', gap: '0.5rem', flexShrink: 0
  },
  sidebarTitle: { color: 'white', margin: '0 0 1rem 0', fontSize: '1rem' },
  link: {
    color: '#ccc', textDecoration: 'none',
    padding: '0.5rem 0.75rem', borderRadius: '4px',
    fontSize: '0.9rem'
  },
  main:      { flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f0f2f5' },
  logoutBtn: {
    marginTop: 'auto', background: 'transparent',
    border: '1px solid #555', color: '#aaa',
    padding: '0.5rem', borderRadius: '4px',
    cursor: 'pointer', fontSize: '0.85rem'
  }
};

export default App;
