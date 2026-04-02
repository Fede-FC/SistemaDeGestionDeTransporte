import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, formStyles, buttonStyles, badgeStyles, pageStyles } from '../styles/common';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [error, setError]         = useState('');
  const [form, setForm] = useState({ id_number: '', fullname: '', hire_date: '', termination_date: '' });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch {
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, termination_date: form.termination_date || null, active: true };
      if (editing) {
        await api.put(`/employees/${editing}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ id_number: '', fullname: '', hire_date: '', termination_date: '' });
      fetchEmployees();
    } catch {
      setError('Error al guardar empleado');
    }
  };

  const handleEdit = (e) => {
    setEditing(e.employeeid);
    setForm({
      id_number: e.id_number,
      fullname: e.fullname,
      hire_date: e.hire_date?.split('T')[0] || '',
      termination_date: e.termination_date?.split('T')[0] || ''
    });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este empleado?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch {
      setError('Error al desactivar empleado');
    }
  };

  const handleActivate = async (id) => {
    try {
      const emp = employees.find(e => e.employeeid === id);
      await api.put(`/employees/${id}`, {
        id_number: emp.id_number,
        fullname: emp.fullname,
        hire_date: emp.hire_date?.split('T')[0],
        termination_date: emp.termination_date?.split('T')[0] || null,
        active: true
      });
      fetchEmployees();
    } catch {
      setError('Error al activar empleado');
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ id_number: '', fullname: '', hire_date: '', termination_date: '' });
    setShowForm(true);
  };

  const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...badgeStyles, ...pageStyles };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Empleados</h2>
        <button style={styles.btnPrimary} onClick={handleNew}>+ Nuevo empleado</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Editar empleado' : 'Nuevo empleado'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Cédula</label>
                <input style={styles.input} value={form.id_number}
                  onChange={e => setForm({ ...form, id_number: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nombre completo</label>
                <input style={styles.input} value={form.fullname}
                  onChange={e => setForm({ ...form, fullname: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de contratación</label>
                <input style={styles.input} type="date" value={form.hire_date}
                  onChange={e => setForm({ ...form, hire_date: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de salida (opcional)</label>
                <input style={styles.input} type="date" value={form.termination_date}
                  onChange={e => setForm({ ...form, termination_date: e.target.value })} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.btnSecondary}
                onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" style={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear empleado'}
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
                {['Cédula', 'Nombre', 'Contratado', 'Salida', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={6} style={styles.empty}>No hay empleados registrados</td></tr>
              ) : employees.map(e => (
                <tr key={e.employeeid} style={styles.tr}>
                  <td style={styles.td}>{e.id_number}</td>
                  <td style={styles.td}>{e.fullname}</td>
                  <td style={styles.td}>{e.hire_date?.split('T')[0]}</td>
                  <td style={styles.td}>{e.termination_date?.split('T')[0] || '—'}</td>
                  <td style={styles.td}>
                    <span style={e.active ? styles.badgeActive : styles.badgeInactive}>
                      {e.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(e)}>Editar</button>
                    {e.active ? (
                      <button style={styles.btnDelete} onClick={() => handleDeactivate(e.employeeid)}>Desactivar</button>
                    ) : (
                      <button style={styles.btnActivate} onClick={() => handleActivate(e.employeeid)}>Activar</button>
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

export default Employees;