const mongoose = require('mongoose');

//id, name , password, phone number, role

const forgotPasswordSchema = new mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    active: Boolean,
    expiresBy: Date,
  });
  
  module.exports = mongoose.model('Forgotpassword', forgotPasswordSchema);
  
