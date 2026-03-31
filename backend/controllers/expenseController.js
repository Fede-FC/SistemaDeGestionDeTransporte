const pool = require('../config/db');
require('dotenv').config();
const OWNER_ID = parseInt(process.env.OWNER_ID);

const getExpenses = async (req, res) => {
  try {
    const { tripid, vehicleid } = req.query;
    let query = `SELECT * FROM expenses WHERE userid = $1`;
    const params = [OWNER_ID];
    let i = 2;
    if (tripid)   { query += ` AND tripid = $${i++}`;   params.push(tripid); }
    if (vehicleid){ query += ` AND vehicleid = $${i++}`; params.push(vehicleid); }
    query += ` ORDER BY expense_date DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { expense_type, amount, description, tripid, vehicleid, expense_date } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses
        (expense_type, amount, description, tripid, vehicleid, userid, expense_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [expense_type, amount, description || null,
       tripid || null, vehicleid || null, OWNER_ID,
       expense_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expense_type, amount, description, tripid, vehicleid, expense_date } = req.body;
    const result = await pool.query(
      `UPDATE expenses SET
        expense_type=$1, amount=$2, description=$3,
        tripid=$4, vehicleid=$5, expense_date=$6,
        updated_at=CURRENT_TIMESTAMP
       WHERE expenseid=$7 AND userid=$8 RETURNING *`,
      [expense_type, amount, description || null,
       tripid || null, vehicleid || null, expense_date,
       id, OWNER_ID]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `DELETE FROM expenses WHERE expenseid = $1 AND userid = $2`,
      [id, OWNER_ID]
    );
    res.json({ message: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };