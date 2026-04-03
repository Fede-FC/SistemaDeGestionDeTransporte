const pool = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM employees WHERE userid = $1 ORDER BY fullname ASC`,
      [req.user.userid]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM employees WHERE employeeid = $1 AND userid = $2`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { id_number, fullname, hire_date } = req.body;
    const result = await pool.query(
      `INSERT INTO employees (id_number, fullname, hire_date, userid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_number, fullname, hire_date, req.user.userid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_number, fullname, hire_date, termination_date, active } = req.body;
    const result = await pool.query(
      `UPDATE employees SET id_number=$1, fullname=$2, hire_date=$3,
       termination_date=$4, active=$5
       WHERE employeeid=$6 AND userid=$7 RETURNING *`,
      [id_number, fullname, hire_date, termination_date || null, active, id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE employees SET active = false WHERE employeeid = $1 AND userid = $2 RETURNING *`,
      [id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ message: 'Empleado desactivado', employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };