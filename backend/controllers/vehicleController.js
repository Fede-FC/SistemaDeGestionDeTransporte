const pool = require('../config/db');
const { validatePlate, validateVehicleYear, collectErrors } = require('../middleware/validators');

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

    // RF-01: Restricciones de negocio
    const errors = collectErrors([
      validatePlate(plate),
      validateVehicleYear(year),
      !brand || !brand.trim() ? 'La marca es obligatoria' : null,
      !model || !model.trim() ? 'El modelo es obligatorio' : null,
    ]);
    if (errors.length) return res.status(400).json({ errors });

    const normalizedPlate = plate.trim().toUpperCase();

    // RF-01: No se permiten placas duplicadas
    const dup = await pool.query(
      `SELECT vehicleid FROM vehicles WHERE plate = $1 AND userid = $2`,
      [normalizedPlate, req.user.userid]
    );
    if (dup.rows.length > 0)
      return res.status(409).json({ errors: ['La placa ya se encuentra registrada en el sistema'] });

    const result = await pool.query(
      `INSERT INTO vehicles (plate, brand, model, year, userid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [normalizedPlate, brand.trim(), model.trim(), parseInt(year), req.user.userid]
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

    // RF-02: Validar campos al editar
    const errors = collectErrors([
      validatePlate(plate),
      validateVehicleYear(year),
      !brand || !brand.trim() ? 'La marca es obligatoria' : null,
      !model || !model.trim() ? 'El modelo es obligatorio' : null,
    ]);
    if (errors.length) return res.status(400).json({ errors });

    const normalizedPlate = plate.trim().toUpperCase();

    // Verificar que la placa no esté en uso por otro vehículo
    const dup = await pool.query(
      `SELECT vehicleid FROM vehicles WHERE plate = $1 AND userid = $2 AND vehicleid != $3`,
      [normalizedPlate, req.user.userid, id]
    );
    if (dup.rows.length > 0)
      return res.status(409).json({ errors: ['La placa ya está registrada en otro vehículo'] });

    const result = await pool.query(
      `UPDATE vehicles SET plate=$1, brand=$2, model=$3, year=$4, active=$5
       WHERE vehicleid=$6 AND userid=$7 RETURNING *`,
      [normalizedPlate, brand.trim(), model.trim(), parseInt(year), active, id, req.user.userid]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RF-02: Desactivación lógica — no se permite eliminación física (RA-03)
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
