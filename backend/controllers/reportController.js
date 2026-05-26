const pool = require('../config/db');

// RF-11: Reporte de ingresos mensuales agrupados por mes calendario
const getMonthlyIncomeReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    let dateFilter = '';
    const params = [req.user.userid];
    let i = 2;

    if (from) { dateFilter += ` AND t.trip_date >= $${i++}`; params.push(from); }
    if (to)   { dateFilter += ` AND t.trip_date <= $${i++}`; params.push(to); }

    const result = await pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', t.trip_date), 'YYYY-MM') AS month,
         TO_CHAR(DATE_TRUNC('month', t.trip_date), 'Month YYYY') AS month_label,
         COUNT(t.tripid) AS trip_count,
         SUM(t.payment_received) AS total_income,
         COALESCE(SUM(ex_total.total_exp), 0) AS total_expenses,
         SUM(t.payment_received) - COALESCE(SUM(ex_total.total_exp), 0) AS net_profit
       FROM trips t
       LEFT JOIN (
         SELECT tripid, SUM(amount) AS total_exp
         FROM expenses
         WHERE userid = $1
         GROUP BY tripid
       ) ex_total ON ex_total.tripid = t.tripid
       WHERE t.userid = $1 ${dateFilter}
       GROUP BY DATE_TRUNC('month', t.trip_date)
       ORDER BY DATE_TRUNC('month', t.trip_date) DESC`,
      params
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'Sin datos para el período seleccionado', data: [] });
    }

    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RF-12: Reporte de gastos por vehículo desglosado por tipo
const getExpensesByVehicleReport = async (req, res) => {
  try {
    const { from, to, vehicleid } = req.query;

    let dateFilter = '';
    const params = [req.user.userid];
    let i = 2;

    if (from)      { dateFilter += ` AND t.trip_date >= $${i++}`; params.push(from); }
    if (to)        { dateFilter += ` AND t.trip_date <= $${i++}`; params.push(to); }
    if (vehicleid) { dateFilter += ` AND v.vehicleid = $${i++}`;  params.push(vehicleid); }

    const result = await pool.query(
      `SELECT
         v.vehicleid,
         v.plate,
         v.brand,
         v.model,
         COUNT(DISTINCT t.tripid) AS trip_count,
         COALESCE(SUM(CASE WHEN ex.expense_type = 'Fuel'        THEN ex.amount ELSE 0 END), 0) AS fuel,
         COALESCE(SUM(CASE WHEN ex.expense_type = 'Tolls'       THEN ex.amount ELSE 0 END), 0) AS tolls,
         COALESCE(SUM(CASE WHEN ex.expense_type = 'Maintenance' THEN ex.amount ELSE 0 END), 0) AS maintenance,
         COALESCE(SUM(CASE WHEN ex.expense_type = 'Repairs'     THEN ex.amount ELSE 0 END), 0) AS repairs,
         COALESCE(SUM(CASE WHEN ex.expense_type = 'Other'       THEN ex.amount ELSE 0 END), 0) AS other,
         COALESCE(SUM(ex.amount), 0) AS total_expenses
       FROM vehicles v
       JOIN trips t    ON t.vehicleid = v.vehicleid AND t.userid = $1
       JOIN expenses ex ON ex.tripid = t.tripid AND ex.userid = $1
       WHERE v.userid = $1 ${dateFilter}
       GROUP BY v.vehicleid, v.plate, v.brand, v.model
       HAVING SUM(ex.amount) > 0
       ORDER BY total_expenses DESC`,
      params
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'Sin datos para los criterios seleccionados', data: [] });
    }

    // CA-12.3: Total general = suma de todos los vehículos
    const grand_total = result.rows.reduce((acc, r) => acc + parseFloat(r.total_expenses), 0);

    res.json({ data: result.rows, grand_total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMonthlyIncomeReport, getExpensesByVehicleReport };
