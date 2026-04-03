const pool = require('../config/db');

const getClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM clients WHERE userid = $1 ORDER BY name ASC`,
      [req.user.userid]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM clients WHERE clientid = $1 AND userid = $2`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, contact } = req.body;
    const result = await pool.query(
      `INSERT INTO clients (name, contact, userid)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, contact || null, req.user.userid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, active } = req.body;
    const result = await pool.query(
      `UPDATE clients SET name=$1, contact=$2, active=$3, updated_at=CURRENT_TIMESTAMP
       WHERE clientid=$4 AND userid=$5 RETURNING *`,
      [name, contact || null, active !== undefined ? active : true, id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE clients SET active = false WHERE clientid = $1 AND userid = $2 RETURNING *`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente desactivado', client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getClients, getClientById, createClient, updateClient, deleteClient };