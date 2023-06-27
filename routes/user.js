const express = require('express');

const userController = require('../controller/user');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    await userController.signup(req, res);
  } catch(err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    await userController.login(req, res)
  } catch(err) {
    next(err);
  }
});

module.exports = router;
