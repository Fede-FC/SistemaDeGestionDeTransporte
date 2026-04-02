import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, formStyles, buttonStyles, badgeStyles, pageStyles } from '../styles/common';

function Trips() {
  const [search, setSearch] = useState('');
  const [trips, setTrips]       = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients]   = useState([]);
  const [states, setStates]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [error, setError]       = useState('');

  const emptyForm = {
    trip_date: '', vehicleid: '', driverid: '', origin: '',
    destination: '', clientid: '', payment_received: '',
    container_number: '', invoice_number: '', description: '',
    dua_number: '', equipment_size: '', weight: '',
    operation_type: '', stateid: ''
  };
  const [form, setForm] = useState(emptyForm);

  const [filters, setFilters] = useState({
    from: '', to: '', vehicleid: '', clientid: '', driverid: ''
  });

  const fetchAll = async () => {
    try {
      const [tripsRes, vehiclesRes, employeesRes, clientsRes, statesRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
        api.get('/employees'),
        api.get('/clients'),
        api.get('/trips/states').catch(() => ({ data: [] }))
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data.filter(v => v.active));
      setEmployees(employeesRes.data.filter(e => e.active));
      setClients(clientsRes.data.filter(c => c.active));
      setStates(statesRes.data);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchTrips = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from)      params.append('from', filters.from);
      if (filters.to)        params.append('to', filters.to);
      if (filters.vehicleid) params.append('vehicleid', filters.vehicleid);
      if (filters.clientid)  params.append('clientid', filters.clientid);
      if (filters.driverid)  params.append('driverid', filters.driverid);
      const res = await api.get(`/trips?${params.toString()}`);
      setTrips(res.data);
    } catch {
      setError('Error al filtrar viajes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/trips/${editing}`, form);
      } else {
        await api.post('/trips', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchTrips();
    } catch {
      setError('Error al guardar viaje');
    }
  };

  const handleEdit = (t) => {
    setEditing(t.tripid);
    setForm({
      trip_date:        t.trip_date?.split('T')[0] || '',
      vehicleid:        t.vehicleid,
      driverid:         t.driverid,
      origin:           t.origin,
      destination:      t.destination,
      clientid:         t.clientid,
      payment_received: t.payment_received,
      container_number: t.container_number || '',
      invoice_number:   t.invoice_number || '',
      description:      t.description || '',
      dua_number:       t.dua_number || '',
      equipment_size:   t.equipment_size || '',
      weight:           t.weight || '',
      operation_type:   t.operation_type || '',
      stateid:          t.stateid
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este viaje?')) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchTrips();
    } catch {
      setError('Error al eliminar viaje');
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const f = (val) => Number(val).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

  const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...badgeStyles, ...pageStyles };
  const filteredTrips = search.trim()
  ? trips.filter(t => 
      (t.container_number || '').toLowerCase().includes(search.trim().toLowerCase())
    )
  : trips;
  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Viajes</h2>
        <button style={styles.btnPrimary} onClick={handleNew}>+ Nuevo viaje</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Filtros */}
      
      <div style={styles.formCard}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={styles.field}>
            <label style={styles.label}>Buscar por N° de contenedor</label>
            <input style={styles.input} placeholder="Ej: MSCU123456"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Desde</label>
            <input style={styles.input} type="date" value={filters.from}
              onChange={e => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Hasta</label>
            <input style={styles.input} type="date" value={filters.to}
              onChange={e => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Vehículo</label>
            <select style={styles.select} value={filters.vehicleid}
              onChange={e => setFilters({ ...filters, vehicleid: e.target.value })}>
              <option value="">Todos</option>
              {vehicles.map(v => <option key={v.vehicleid} value={v.vehicleid}>{v.plate}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Cliente</label>
            <select style={styles.select} value={filters.clientid}
              onChange={e => setFilters({ ...filters, clientid: e.target.value })}>
              <option value="">Todos</option>
              {clients.map(c => <option key={c.clientid} value={c.clientid}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={styles.btnPrimary} onClick={fetchTrips}>Filtrar</button>
            <button style={styles.btnSecondary} onClick={() => {
              setFilters({ from: '', to: '', vehicleid: '', clientid: '', driverid: '' });
              fetchAll();
            }}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Editar viaje' : 'Nuevo viaje'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Fecha</label>
                <input style={styles.input} type="date" value={form.trip_date}
                  onChange={e => setForm({ ...form, trip_date: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Tipo de operación</label>
                <select style={styles.select} value={form.operation_type}
                  onChange={e => setForm({ ...form, operation_type: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option value="Import">Importación</option>
                  <option value="Export">Exportación</option>
                  <option value="National">Nacional</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Vehículo</label>
                <select style={styles.select} value={form.vehicleid}
                  onChange={e => setForm({ ...form, vehicleid: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {vehicles.map(v => <option key={v.vehicleid} value={v.vehicleid}>{v.plate} — {v.brand} {v.model}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Conductor</label>
                <select style={styles.select} value={form.driverid}
                  onChange={e => setForm({ ...form, driverid: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {employees.map(e => <option key={e.employeeid} value={e.employeeid}>{e.fullname}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Cliente</label>
                <select style={styles.select} value={form.clientid}
                  onChange={e => setForm({ ...form, clientid: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {clients.map(c => <option key={c.clientid} value={c.clientid}>{c.name}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Pago recibido</label>
                <input style={styles.input} type="number" step="0.01" value={form.payment_received}
                  onChange={e => setForm({ ...form, payment_received: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Origen</label>
                <input style={styles.input} value={form.origin}
                  onChange={e => setForm({ ...form, origin: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Destino</label>
                <input style={styles.input} value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Número de contenedor</label>
                <input style={styles.input} value={form.container_number}
                  onChange={e => setForm({ ...form, container_number: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Número DUA</label>
                <input style={styles.input} value={form.dua_number}
                  onChange={e => setForm({ ...form, dua_number: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Tamaño del equipo</label>
                <select style={styles.select} value={form.equipment_size}
                  onChange={e => setForm({ ...form, equipment_size: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option value="20ft">20 pies</option>
                  <option value="40ft">40 pies</option>
                  <option value="40ft HC">40 pies High Cube</option>
                  <option value="45ft">45 pies</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Peso (kg)</label>
                <input style={styles.input} type="number" step="0.01" value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Número de factura</label>
                <input style={styles.input} value={form.invoice_number}
                  onChange={e => setForm({ ...form, invoice_number: e.target.value })} />
              </div>
              {editing && (
                <div style={styles.field}>
                  <label style={styles.label}>Estado</label>
                  <select style={styles.select} value={form.stateid}
                    onChange={e => setForm({ ...form, stateid: e.target.value })}>
                    {states.map(s => <option key={s.stateid} value={s.stateid}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <textarea style={styles.textarea} rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.btnSecondary}
                onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" style={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear viaje'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading ? <p>Cargando...</p> : (
        <div style={{ ...styles.tableWrapper, overflowX: 'auto' }}>
          <table style={{ ...styles.table, minWidth: '1400px' }}>
            <thead>
              <tr>
                {['Fecha', 'Cliente', 'Vehículo', 'Conductor', 'Origen → Destino',
                  'Operación', 'Tamaño', 'Contenedor', 'DUA', 'Pago',
                  'Gastos', 'Ganancia', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr><td colSpan={14} style={styles.empty}>No hay viajes registrados</td></tr>
              ) : filteredTrips.map(t => (
                <tr key={t.tripid} style={styles.tr}>
                  <td style={styles.td}>{t.trip_date?.split('T')[0]}</td>
                  <td style={styles.td}>{t.client_name}</td>
                  <td style={styles.td}>{t.plate}</td>
                  <td style={styles.td}>{t.driver_name}</td>
                  <td style={styles.td}>{t.origin} → {t.destination}</td>
                  <td style={styles.td}>{t.operation_type || '—'}</td>
                  <td style={styles.td}>{t.equipment_size || '—'}</td>
                  <td style={styles.td}>{t.container_number || '—'}</td>
                  <td style={styles.td}>{t.dua_number || '—'}</td>
                  <td style={styles.td}>{f(t.payment_received)}</td>
                  <td style={styles.td}>{f(t.total_expenses)}</td>
                  <td style={{ ...styles.td, color: t.profit >= 0 ? '#2e7d32' : '#c62828', fontWeight: 500 }}>
                    {f(t.profit)}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badgeActive, whiteSpace: 'nowrap' }}>
                      {t.state_name}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(t)}>Editar</button>
                    <button style={styles.btnDelete} onClick={() => handleDelete(t.tripid)}>Eliminar</button>
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

export default Trips;