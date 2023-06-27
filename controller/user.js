const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signup = (req, res) => {
  const { name, email, password } = req.body;
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.log('Unable to create a new user');
        return res.json({ message: 'Unable to create a new user' });
      }
      User.create({ name, email, password: hash })
        .then(() => {
          res.status(201).json({ message: 'Successfully created a new user' });
        })
        .catch((err) => {
          res.status(403).json(err);
        });
    });
  });
};

function generateAccessToken(id, name, isPremium) {
  return jwt.sign({ userId: id, name: name, isPremium }, process.env.RAZORPAY_KEY_SECRET);
}

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'Invalid email or password' });
      }
      bcrypt.compare(password, user.password, function (err, response) {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, message: 'Something went wrong' });
        }
        if (response) {
          const token = generateAccessToken(user.id, user.name, user.isPremium);
          console.log(token)
          return res.status(200).json({ success: true, token });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Something went wrong' });
    });
};

module.exports = {
  signup,
  login,
};
