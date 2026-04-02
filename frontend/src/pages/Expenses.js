import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, formStyles, buttonStyles, pageStyles } from '../styles/common';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [error, setError]       = useState('');

  const emptyForm = {
    expense_type: '', amount: '', description: '',
    tripid: '', vehicleid: '', expense_date: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ tripid: '', vehicleid: '' });

  const fetchAll = async () => {
    try {
      const [expRes, vehRes, tripRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/vehicles'),
        api.get('/trips'),
      ]);
      setExpenses(expRes.data);
      setVehicles(vehRes.data.filter(v => v.active));
      setTrips(tripRes.data);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.tripid)   params.append('tripid', filters.tripid);
      if (filters.vehicleid) params.append('vehicleid', filters.vehicleid);
      const res = await api.get(`/expenses?${params.toString()}`);
      setExpenses(res.data);
    } catch {
      setError('Error al filtrar gastos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tripid:    form.tripid    || null,
        vehicleid: form.vehicleid || null,
        expense_date: form.expense_date || new Date().toISOString()
      };
      if (editing) {
        await api.put(`/expenses/${editing}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchAll();
    } catch {
      setError('Error al guardar gasto');
    }
  };

  const handleEdit = (ex) => {
    setEditing(ex.expenseid);
    setForm({
      expense_type: ex.expense_type,
      amount:       ex.amount,
      description:  ex.description || '',
      tripid:       ex.tripid || '',
      vehicleid:    ex.vehicleid || '',
      expense_date: ex.expense_date?.split('T')[0] || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchAll();
    } catch {
      setError('Error al eliminar gasto');
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const f = (val) => Number(val).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

  const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...pageStyles };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Gastos</h2>
        <button style={styles.btnPrimary} onClick={handleNew}>+ Nuevo gasto</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Filtros */}
      <div style={styles.formCard}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={styles.field}>
            <label style={styles.label}>Filtrar por viaje</label>
            <select style={styles.select} value={filters.tripid}
              onChange={e => setFilters({ ...filters, tripid: e.target.value })}>
              <option value="">Todos</option>
              {trips.map(t => (
                <option key={t.tripid} value={t.tripid}>
                  {t.trip_date?.split('T')[0]} — {t.client_name} — {t.origin} → {t.destination}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Filtrar por vehículo</label>
            <select style={styles.select} value={filters.vehicleid}
              onChange={e => setFilters({ ...filters, vehicleid: e.target.value })}>
              <option value="">Todos</option>
              {vehicles.map(v => (
                <option key={v.vehicleid} value={v.vehicleid}>{v.plate} — {v.brand} {v.model}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={styles.btnPrimary} onClick={fetchExpenses}>Filtrar</button>
            <button style={styles.btnSecondary} onClick={() => {
              setFilters({ tripid: '', vehicleid: '' });
              fetchAll();
            }}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Editar gasto' : 'Nuevo gasto'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Tipo de gasto</label>
                <select style={styles.select} value={form.expense_type}
                  onChange={e => setForm({ ...form, expense_type: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  <option value="Fuel">Combustible</option>
                  <option value="Tolls">Peajes</option>
                  <option value="Maintenance">Mantenimiento</option>
                  <option value="Repairs">Reparaciones</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Monto</label>
                <input style={styles.input} type="number" step="0.01" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha</label>
                <input style={styles.input} type="date" value={form.expense_date}
                  onChange={e => setForm({ ...form, expense_date: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Asociar a viaje (opcional)</label>
                <select style={styles.select} value={form.tripid}
                  onChange={e => setForm({ ...form, tripid: e.target.value })}>
                  <option value="">Sin viaje</option>
                  {trips.map(t => (
                    <option key={t.tripid} value={t.tripid}>
                      {t.trip_date?.split('T')[0]} — {t.client_name} — {t.origin} → {t.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Asociar a vehículo (opcional)</label>
                <select style={styles.select} value={form.vehicleid}
                  onChange={e => setForm({ ...form, vehicleid: e.target.value })}>
                  <option value="">Sin vehículo</option>
                  {vehicles.map(v => (
                    <option key={v.vehicleid} value={v.vehicleid}>{v.plate} — {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <textarea style={styles.textarea} rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.btnSecondary}
                onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" style={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear gasto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading ? <p>Cargando...</p> : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Fecha', 'Tipo', 'Monto', 'Viaje', 'Vehículo', 'Descripción', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={7} style={styles.empty}>No hay gastos registrados</td></tr>
              ) : expenses.map(ex => {
                const trip = trips.find(t => t.tripid === ex.tripid);
                const vehicle = vehicles.find(v => v.vehicleid === ex.vehicleid);
                return (
                  <tr key={ex.expenseid} style={styles.tr}>
                    <td style={styles.td}>{ex.expense_date?.split('T')[0]}</td>
                    <td style={styles.td}>{ex.expense_type}</td>
                    <td style={styles.td}>{f(ex.amount)}</td>
                    <td style={styles.td}>
                      {trip ? `${trip.trip_date?.split('T')[0]} — ${trip.client_name}` : '—'}
                    </td>
                    <td style={styles.td}>{vehicle ? vehicle.plate : '—'}</td>
                    <td style={styles.td}>{ex.description || '—'}</td>
                    <td style={styles.td}>
                      <button style={styles.btnEdit} onClick={() => handleEdit(ex)}>Editar</button>
                      <button style={styles.btnDelete} onClick={() => handleDelete(ex.expenseid)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Expenses;