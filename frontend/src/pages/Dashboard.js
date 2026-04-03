import { useState, useEffect } from 'react';
import api from '../services/api';
import { tableStyles, pageStyles } from '../styles/common';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalTrips: 0, totalIncome: 0, totalExpenses: 0, totalProfit: 0
  });
  const [recentTrips, setRecentTrips]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [period, setPeriod]             = useState('month');
  const [customFrom, setCustomFrom]     = useState('');
  const [customTo, setCustomTo]         = useState('');

  const getRange = (p) => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const today = fmt(now);

    if (p === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { from: fmt(start), to: today };
    }
    if (p === 'month') {
      const from = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;
      return { from, to: today };
    }
    if (p === 'year') {
      return { from: `${now.getFullYear()}-01-01`, to: today };
    }
    if (p === 'custom') {
      return { from: customFrom, to: customTo };
    }
    return { from: '', to: '' };
  };

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const { from, to } = getRange(p);
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to)   params.append('to', to);

      const [tripsRes, allExpensesRes] = await Promise.all([
        api.get(`/trips?${params.toString()}`),
        api.get(`/expenses`),
      ]);

      const trips = tripsRes.data;

      const totalIncome   = trips.reduce((sum, t) => sum + Number(t.payment_received || 0), 0);
      const totalExpenses = trips.reduce((sum, t) => sum + Number(t.total_expenses || 0), 0);

      setSummary({
        totalTrips: trips.length,
        totalIncome,
        totalExpenses,
        totalProfit: totalIncome - totalExpenses,
      });

      setRecentTrips(trips.slice(0, 5));
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(period); }, [period]);

  const handleCustomFilter = () => {
    if (customFrom && customTo) fetchData('custom');
  };

  const f = (val) => Number(val).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });
  const styles = { ...tableStyles, ...pageStyles };

  const periodLabel = {
    week: 'esta semana', month: 'este mes', year: 'este año', custom: 'período seleccionado'
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard</h2>
      </div>

      {/* Filtros de período */}
      <div style={filter.bar}>
        {['week', 'month', 'year', 'custom'].map(p => (
          <button key={p} style={period === p ? filter.btnActive : filter.btn}
            onClick={() => setPeriod(p)}>
            {p === 'week' ? 'Esta semana' : p === 'month' ? 'Este mes' : p === 'year' ? 'Este año' : 'Personalizado'}
          </button>
        ))}
        {period === 'custom' && (
          <div style={filter.custom}>
            <input type="date" style={filter.input} value={customFrom}
              onChange={e => setCustomFrom(e.target.value)} />
            <span style={{ color: '#666', fontSize: '0.85rem' }}>hasta</span>
            <input type="date" style={filter.input} value={customTo}
              onChange={e => setCustomTo(e.target.value)} />
            <button style={filter.btnActive} onClick={handleCustomFilter}>Aplicar</button>
          </div>
        )}
      </div>

      {loading ? <p>Cargando...</p> : (
        <>
          {/* Tarjetas */}
          <div style={card.grid}>
            <div style={card.base}>
              <p style={card.label}>Viajes — {periodLabel[period]}</p>
              <p style={card.value}>{summary.totalTrips}</p>
            </div>
            <div style={card.base}>
              <p style={card.label}>Ingresos</p>
              <p style={{ ...card.value, color: '#1565c0' }}>{f(summary.totalIncome)}</p>
            </div>
            <div style={card.base}>
              <p style={card.label}>Gastos</p>
              <p style={{ ...card.value, color: '#c62828' }}>{f(summary.totalExpenses)}</p>
            </div>
            <div style={card.base}>
              <p style={card.label}>Ganancia</p>
              <p style={{ ...card.value, color: summary.totalProfit >= 0 ? '#2e7d32' : '#c62828' }}>
                {f(summary.totalProfit)}
              </p>
            </div>
          </div>

          {/* Últimos viajes */}
          <h3 style={{ margin: '1.5rem 0 0.75rem', color: '#1a1a2e', fontWeight: 500 }}>
            Últimos 5 viajes del período
          </h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Fecha', 'Cliente', 'Vehículo', 'Origen → Destino',
                    'Pago', 'Gastos', 'Ganancia', 'Estado'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr><td colSpan={8} style={styles.empty}>No hay viajes en este período</td></tr>
                ) : recentTrips.map(t => (
                  <tr key={t.tripid} style={styles.tr}>
                    <td style={styles.td}>{t.trip_date?.split('T')[0]}</td>
                    <td style={styles.td}>{t.client_name}</td>
                    <td style={styles.td}>{t.plate}</td>
                    <td style={styles.td}>{t.origin} → {t.destination}</td>
                    <td style={styles.td}>{f(t.payment_received)}</td>
                    <td style={styles.td}>{f(t.total_expenses)}</td>
                    <td style={{ ...styles.td, color: t.profit >= 0 ? '#2e7d32' : '#c62828', fontWeight: 500 }}>
                      {f(t.profit)}
                    </td>
                    <td style={styles.td}>{t.state_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const card = {
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
  base:  { background: 'white', borderRadius: '8px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  label: { margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#666' },
  value: { margin: 0, fontSize: '1.4rem', fontWeight: 600, color: '#1a1a2e' },
};

const filter = {
  bar:       { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' },
  btn:       { background: 'white', border: '1px solid #ddd', padding: '0.4rem 0.9rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', color: '#555' },
  btnActive: { background: '#1a1a2e', border: '1px solid #1a1a2e', padding: '0.4rem 0.9rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', color: 'white' },
  custom:    { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  input:     { padding: '0.4rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.875rem' },
};
// FC: Esta pagina funciona con la voluntad de Dios y a pura IA
export default Dashboard;