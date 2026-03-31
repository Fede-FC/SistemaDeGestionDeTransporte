const express = require('express');
const router  = express.Router();
const { login, setupPassword } = require('../controllers/authController');

router.post('/login',          login);
router.post('/setup-password', setupPassword); // Solo para setup inicial
module.exports = router;