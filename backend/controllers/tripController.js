const pool = require('../config/db');
require('dotenv').config();
const OWNER_ID = parseInt(process.env.OWNER_ID);

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
      JOIN vehicles v   ON t.vehicleid = v.vehicleid
      JOIN employees e  ON t.driverid  = e.employeeid
      JOIN clients c    ON t.clientid  = c.clientid
      JOIN trip_states ts ON t.stateid = ts.stateid
      LEFT JOIN expenses ex ON ex.tripid = t.tripid
      WHERE t.userid = $1
    `;
    const params = [OWNER_ID];
    let i = 2;

    if (from)       { query += ` AND t.trip_date >= $${i++}`; params.push(from); }
    if (to)         { query += ` AND t.trip_date <= $${i++}`; params.push(to); }
    if (vehicleid)  { query += ` AND t.vehicleid = $${i++}`; params.push(vehicleid); }
    if (clientid)   { query += ` AND t.clientid = $${i++}`;  params.push(clientid); }
    if (driverid)   { query += ` AND t.driverid = $${i++}`;  params.push(driverid); }

    query += ` GROUP BY t.tripid, v.plate, v.brand, v.model,
               e.fullname, c.name, ts.name
               ORDER BY t.trip_date DESC`;

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
      `SELECT t.*,
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
       WHERE t.tripid = $1 AND t.userid = $2
       GROUP BY t.tripid, v.plate, v.brand, v.model,
                e.fullname, c.name, ts.name`,
      [id, OWNER_ID]
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
      clientid, payment_received, container_number,
      invoice_number, description
    } = req.body;
    const result = await pool.query(
      `INSERT INTO trips
        (trip_date, vehicleid, driverid, origin, destination,
         clientid, payment_received, container_number,
         invoice_number, description, userid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [trip_date, vehicleid, driverid, origin, destination,
       clientid, payment_received || 0, container_number || null,
       invoice_number || null, description || null, OWNER_ID]
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
      trip_date, vehicleid, driverid, origin, destination,
      clientid, payment_received, container_number,
      invoice_number, description, stateid
    } = req.body;
    const result = await pool.query(
      `UPDATE trips SET
        trip_date=$1, vehicleid=$2, driverid=$3, origin=$4,
        destination=$5, clientid=$6, payment_received=$7,
        container_number=$8, invoice_number=$9, description=$10,
        stateid=$11, updated_at=CURRENT_TIMESTAMP
       WHERE tripid=$12 AND userid=$13 RETURNING *`,
      [trip_date, vehicleid, driverid, origin, destination,
       clientid, payment_received, container_number || null,
       invoice_number || null, description || null,
       stateid, id, OWNER_ID]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `DELETE FROM trips WHERE tripid = $1 AND userid = $2`,
      [id, OWNER_ID]
    );
    res.json({ message: 'Viaje eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };