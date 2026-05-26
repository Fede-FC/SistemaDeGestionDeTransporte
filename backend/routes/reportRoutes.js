const express = require('express');
const router  = express.Router();
const { getMonthlyIncomeReport, getExpensesByVehicleReport } = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');

// RF-11: Ingresos mensuales — GET /api/reports/income-monthly?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/income-monthly', verifyToken, getMonthlyIncomeReport);

// RF-12: Gastos por vehículo — GET /api/reports/expenses-by-vehicle?from=...&to=...&vehicleid=...
router.get('/expenses-by-vehicle', verifyToken, getExpensesByVehicleReport);

module.exports = router;
