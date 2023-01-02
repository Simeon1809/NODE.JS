const express = require('express')
const router = express.Router();
const authControlle = require('../../controllers/authController');

router.post('/', authControlle.handleLogin)

module.exports = router;