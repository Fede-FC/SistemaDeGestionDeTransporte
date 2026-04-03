const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const pool        = require('../config/db');
router.use(verifyToken);
router.get('/states', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trip_states ORDER BY stateid');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/',       getTrips);
router.get('/:id',    getTripById);
router.post('/',      createTrip);
router.put('/:id',    updateTrip);
router.delete('/:id', deleteTrip);
module.exports = router;
