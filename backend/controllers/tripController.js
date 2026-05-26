const pool = require('../config/db');
const { validateDateNotFuture, validatePositiveAmount, collectErrors } = require('../middleware/validators');

const getTrips = async (req, res) => {
  try {
    const { from, to, vehicleid, clientid, driverid } = req.query;
    let query = `
      SELECT t.*,
        v.plate, v.brand, v.model,
        e.fullname AS driver_name,
        c.name AS client_name,
        ts.name AS state_name,
        COALESCE(SUM(ex.amount), 0) AS total_expenses,
        t.payment_received - COALESCE(SUM(ex.amount), 0) AS profit
      FROM trips t
      JOIN vehicles v    ON t.vehicleid = v.vehicleid
      JOIN employees e   ON t.driverid  = e.employeeid
      JOIN clients c     ON t.clientid  = c.clientid
      JOIN trip_states ts ON t.stateid  = ts.stateid
      LEFT JOIN expenses ex ON ex.tripid = t.tripid
      WHERE t.userid = $1
    `;
    const params = [req.user.userid];
    let i = 2;

    if (from)      { query += ` AND t.trip_date >= $${i++}`; params.push(from); }
    if (to)        { query += ` AND t.trip_date <= $${i++}`; params.push(to); }
    if (vehicleid) { query += ` AND t.vehicleid = $${i++}`; params.push(vehicleid); }
    if (clientid)  { query += ` AND t.clientid  = $${i++}`; params.push(clientid); }
    if (driverid)  { query += ` AND t.driverid  = $${i++}`; params.push(driverid); }

    query += ` GROUP BY t.tripid, v.plate, v.brand, v.model,
               e.fullname, c.name, ts.name ORDER BY t.trip_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, v.plate, v.brand, v.model,
        e.fullname AS driver_name, c.name AS client_name, ts.name AS state_name,
        COALESCE(SUM(ex.amount), 0) AS total_expenses,
        t.payment_received - COALESCE(SUM(ex.amount), 0) AS profit
       FROM trips t
       JOIN vehicles v    ON t.vehicleid = v.vehicleid
       JOIN employees e   ON t.driverid  = e.employeeid
       JOIN clients c     ON t.clientid  = c.clientid
       JOIN trip_states ts ON t.stateid  = ts.stateid
       LEFT JOIN expenses ex ON ex.tripid = t.tripid
       WHERE t.tripid = $1 AND t.userid = $2
       GROUP BY t.tripid, v.plate, v.brand, v.model, e.fullname, c.name, ts.name`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const {
      trip_date, vehicleid, driverid, origin, destination,
      clientid, payment_received, container_number, invoice_number,
      description, dua_number, equipment_size, weight, operation_type
    } = req.body;

    // RF-06: Restricciones de negocio
    const errors = collectErrors([
      !trip_date          ? 'La fecha del viaje es obligatoria' : null,
      validateDateNotFuture(trip_date, 'La fecha del viaje'),
      !vehicleid          ? 'El vehículo es obligatorio' : null,
      !driverid           ? 'El conductor es obligatorio' : null,
      !clientid           ? 'El cliente es obligatorio' : null,
      !origin || !origin.trim()           ? 'El origen es obligatorio' : null,
      !destination || !destination.trim() ? 'El destino es obligatorio' : null,
      validatePositiveAmount(payment_received, 'El pago recibido'),
    ]);
    if (errors.length) return res.status(400).json({ errors });

    // RF-06: Solo se puede asignar vehículos activos
    const vehicle = await pool.query(
      `SELECT active FROM vehicles WHERE vehicleid = $1 AND userid = $2`,
      [vehicleid, req.user.userid]
    );
    if (vehicle.rows.length === 0)
      return res.status(404).json({ errors: ['Vehículo no encontrado'] });
    if (!vehicle.rows[0].active)
      return res.status(400).json({ errors: ['No se puede asignar un vehículo inactivo a un viaje'] });

    // RF-06: Solo se puede asignar conductores activos
    const driver = await pool.query(
      `SELECT active FROM employees WHERE employeeid = $1 AND userid = $2`,
      [driverid, req.user.userid]
    );
    if (driver.rows.length === 0)
      return res.status(404).json({ errors: ['Conductor no encontrado'] });
    if (!driver.rows[0].active)
      return res.status(400).json({ errors: ['No se puede asignar un conductor inactivo a un viaje'] });

    const result = await pool.query(
      `INSERT INTO trips
        (trip_date, vehicleid, driverid, origin, destination, clientid,
         payment_received, container_number, invoice_number, description,
         dua_number, equipment_size, weight, operation_type, userid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [trip_date, vehicleid, driverid, origin.trim(), destination.trim(), clientid,
       parseFloat(payment_received), container_number || null, invoice_number || null,
       description || null, dua_number || null, equipment_size || null,
       weight || null, operation_type || null, req.user.userid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trip_date, vehicleid, driverid, origin, destination, clientid,
      payment_received, container_number, invoice_number, description,
      stateid, dua_number, equipment_size, weight, operation_type
    } = req.body;

    // RF-07: Validar al editar — recalculo de ganancia es automático (RC-04)
    const errors = collectErrors([
      validateDateNotFuture(trip_date, 'La fecha del viaje'),
      validatePositiveAmount(payment_received, 'El pago recibido'),
      !origin || !origin.trim()           ? 'El origen es obligatorio' : null,
      !destination || !destination.trim() ? 'El destino es obligatorio' : null,
    ]);
    if (errors.length) return res.status(400).json({ errors });

    // RF-07: Solo se puede reasignar vehículos y conductores activos (R-02.3, R-04.2)
    const vehicle = await pool.query(
      `SELECT active FROM vehicles WHERE vehicleid = $1 AND userid = $2`,
      [vehicleid, req.user.userid]
    );
    if (vehicle.rows.length === 0)
      return res.status(404).json({ errors: ['Vehículo no encontrado'] });
    if (!vehicle.rows[0].active)
      return res.status(400).json({ errors: ['No se puede asignar un vehículo inactivo a un viaje'] });

    const driver = await pool.query(
      `SELECT active FROM employees WHERE employeeid = $1 AND userid = $2`,
      [driverid, req.user.userid]
    );
    if (driver.rows.length === 0)
      return res.status(404).json({ errors: ['Conductor no encontrado'] });
    if (!driver.rows[0].active)
      return res.status(400).json({ errors: ['No se puede asignar un conductor inactivo a un viaje'] });

    const result = await pool.query(
      `UPDATE trips SET trip_date=$1, vehicleid=$2, driverid=$3, origin=$4,
        destination=$5, clientid=$6, payment_received=$7, container_number=$8,
        invoice_number=$9, description=$10, stateid=$11, dua_number=$12,
        equipment_size=$13, weight=$14, operation_type=$15, updated_at=CURRENT_TIMESTAMP
       WHERE tripid=$16 AND userid=$17 RETURNING *`,
      [trip_date, vehicleid, driverid, origin.trim(), destination.trim(), clientid,
       parseFloat(payment_received), container_number || null, invoice_number || null,
       description || null, stateid, dua_number || null, equipment_size || null,
       weight || null, operation_type || null, id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RF-07: Desactivación lógica — los viajes NO se eliminan físicamente (RA-03)
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE trips SET active = false, updated_at = CURRENT_TIMESTAMP
       WHERE tripid = $1 AND userid = $2 RETURNING *`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json({ message: 'Viaje desactivado', trip: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };
