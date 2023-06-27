const express = require('express');

const premiumController = require('../controller/premium');

const authenticateMiddleware = require('../middleware/auth')

const router = express.Router();



module.exports = router;