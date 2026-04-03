const pool = require('../config/db');

const getVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE userid = $1 ORDER BY vehicleid ASC`,
      [req.user.userid]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE vehicleid = $1 AND userid = $2`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { plate, brand, model, year } = req.body;
    const result = await pool.query(
      `INSERT INTO vehicles (plate, brand, model, year, userid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plate, brand, model, parseInt(year), req.user.userid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate, brand, model, year, active } = req.body;
    const result = await pool.query(
      `UPDATE vehicles SET plate=$1, brand=$2, model=$3, year=$4, active=$5
       WHERE vehicleid=$6 AND userid=$7 RETURNING *`,
      [plate, brand, model, parseInt(year), active, id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE vehicles SET active = false WHERE vehicleid = $1 AND userid = $2 RETURNING *`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo desactivado', vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };