const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
router.get('/',       getTrips);
router.get('/states', async (req, res) => {
  const pool = require('../config/db');
  try {
    const result = await pool.query('SELECT * FROM trip_states ORDER BY stateid');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id',   getTripById);
router.post('/',      createTrip);
router.put('/:id',    updateTrip);
router.delete('/:id', deleteTrip);
module.exports = router;