const express = require('express');

const expenseController = require('../controller/expense');

const userAuthentication = require('../middleware/auth')

const router = express.Router();

router.post('/addexpense', async (req, res, next) => {
  try {
    await expenseController.addExpense(req, res)
  } catch(err) {
    next(err);
  }
  });

  router.get('/getexpenses', userAuthentication.authenticate, expenseController.showExpenses);

    router.delete('/delete/:expenseId', async (req, res, next) => {
      try {
        await expenseController.deleteExpense(req, res)
      } catch(err) {
        next(err);
      }
    });
  
  
  module.exports = router;
  