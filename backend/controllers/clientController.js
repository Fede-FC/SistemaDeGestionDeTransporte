const pool = require('../config/db');
require('dotenv').config();
const OWNER_ID = parseInt(process.env.OWNER_ID);

const getClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM clients WHERE userid = $1 ORDER BY name ASC`,
      [OWNER_ID]
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
      [id, OWNER_ID]
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
      [name, contact || null, OWNER_ID]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    const result = await pool.query(
      `UPDATE clients SET name=$1, contact=$2, updated_at=CURRENT_TIMESTAMP
       WHERE clientid=$3 AND userid=$4 RETURNING *`,
      [name, contact || null, id, OWNER_ID]
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
      `UPDATE clients SET active = false
       WHERE clientid = $1 AND userid = $2 RETURNING *`,
      [id, OWNER_ID]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente desactivado', client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getClients, getClientById, createClient, updateClient, deleteClient };