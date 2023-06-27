const express = require('express');

const purchaseController = require('../controller/purchase');

const premiumController = require('../controller/premium')

const authenticateMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/premiumuser', authenticateMiddleware.authenticate, purchaseController.purchasepremium);

router.post('/updatetransactionstatus', authenticateMiddleware.authenticate, purchaseController.updateTransactionStatus);

router.get('/leaderboard', authenticateMiddleware.authenticate, premiumController.leaderboard);

module.exports = router;