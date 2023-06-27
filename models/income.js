const mongoose = require('mongoose');

//id, name , password, phone number, role

const incomeSchema = new mongoose.Schema({
  incomeAmount: Number,
});

module.exports = mongoose.model('Income', incomeSchema);
