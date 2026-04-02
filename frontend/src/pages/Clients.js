import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, formStyles, buttonStyles, badgeStyles, pageStyles } from '../styles/common';

function Clients() {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({ name: '', contact: '' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/clients/${editing}`, form);
      } else {
        await api.post('/clients', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', contact: '' });
      fetchClients();
    } catch {
      setError('Error al guardar cliente');
    }
  };

  const handleEdit = (c) => {
    setEditing(c.clientid);
    setForm({ name: c.name, contact: c.contact || '' });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este cliente?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch {
      setError('Error al desactivar cliente');
    }
  };

  const handleActivate = async (id) => {
    try {
      const client = clients.find(c => c.clientid === id);
      await api.put(`/clients/${id}`, { name: client.name, contact: client.contact || null, active: true });
      fetchClients();
    } catch {
      setError('Error al activar cliente');
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ name: '', contact: '' });
    setShowForm(true);
  };

  const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...badgeStyles, ...pageStyles };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Clientes</h2>
        <button style={styles.btnPrimary} onClick={handleNew}>+ Nuevo cliente</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre</label>
                <input style={styles.input} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Contacto (teléfono o email)</label>
                <input style={styles.input} value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.btnSecondary}
                onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" style={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nombre', 'Contacto', 'Registrado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={5} style={styles.empty}>No hay clientes registrados</td></tr>
              ) : clients.map(c => (
                <tr key={c.clientid} style={styles.tr}>
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.contact || '—'}</td>
                  <td style={styles.td}>{c.created_at?.split('T')[0]}</td>
                  <td style={styles.td}>
                    <span style={c.active ? styles.badgeActive : styles.badgeInactive}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(c)}>Editar</button>
                    {c.active ? (
                      <button style={styles.btnDelete} onClick={() => handleDeactivate(c.clientid)}>Desactivar</button>
                    ) : (
                      <button style={styles.btnActivate} onClick={() => handleActivate(c.clientid)}>Activar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Clients;