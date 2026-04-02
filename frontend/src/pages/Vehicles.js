import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, formStyles, buttonStyles, badgeStyles, pageStyles } from '../styles/common';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({ plate: '', brand: '', model: '', year: '' });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch {
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/vehicles/${editing}`, { ...form, active: true });
      } else {
        await api.post('/vehicles', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ plate: '', brand: '', model: '', year: '' });
      fetchVehicles();
    } catch {
      setError('Error al guardar vehículo');
    }
  };

  const handleEdit = (v) => {
    setEditing(v.vehicleid);
    setForm({ plate: v.plate, brand: v.brand, model: v.model, year: v.year });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este vehículo?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch {
      setError('Error al desactivar vehículo');
    }
  };

  const handleActivate = async (id) => {
    try {
      const v = vehicles.find(v => v.vehicleid === id);
      await api.put(`/vehicles/${id}`, { plate: v.plate, brand: v.brand, model: v.model, year: v.year, active: true });
      fetchVehicles();
    } catch {
      setError('Error al activar vehículo');
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ plate: '', brand: '', model: '', year: '' });
    setShowForm(true);
  };

  const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...badgeStyles, ...pageStyles };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Vehículos</h2>
        <button style={styles.btnPrimary} onClick={handleNew}>+ Nuevo vehículo</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Placa</label>
                <input style={styles.input} value={form.plate}
                  onChange={e => setForm({ ...form, plate: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Marca</label>
                <input style={styles.input} value={form.brand}
                  onChange={e => setForm({ ...form, brand: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Modelo</label>
                <input style={styles.input} value={form.model}
                  onChange={e => setForm({ ...form, model: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Año</label>
                <input style={styles.input} type="number" value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })} required />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.btnSecondary}
                onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" style={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear vehículo'}
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
                {['Placa', 'Marca', 'Modelo', 'Año', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={6} style={styles.empty}>No hay vehículos registrados</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.vehicleid} style={styles.tr}>
                  <td style={styles.td}>{v.plate}</td>
                  <td style={styles.td}>{v.brand}</td>
                  <td style={styles.td}>{v.model}</td>
                  <td style={styles.td}>{v.year}</td>
                  <td style={styles.td}>
                    <span style={v.active ? styles.badgeActive : styles.badgeInactive}>
                      {v.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(v)}>Editar</button>
                    {v.active ? (
                      <button style={styles.btnDelete} onClick={() => handleDeactivate(v.vehicleid)}>Desactivar</button>
                    ) : (
                      <button style={styles.btnActivate} onClick={() => handleActivate(v.vehicleid)}>Activar</button>
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

export default Vehicles;