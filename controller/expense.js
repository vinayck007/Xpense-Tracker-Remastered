const Expense = require('../models/expense');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { v1: uuidv1 } = require('uuid');
const { use } = require('../routes/user');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  console.log(amount);

  if (!amount || isNaN(amount)) {
    res.status(400).json({ message: "Please enter a valid expense amount." });
    return;
  }
  if (!description) {
    res.status(400).json({ message: "Please enter a description of the expense." });
    return;
  }
  if (!category) {
    res.status(400).json({ message: "Please select a category for the expense." });
    return;
  }

  try {
    const token = req.header('Authorization');
    console.log(token)
    const decoded = jwt.verify(token, process.env.RAZORPAY_KEY_SECRET);
    const userId = decoded.userId;
    console.log(userId);

    const expense = new Expense({
      amount,
      description,
      category,
      user: userId,
    });
    console.log(expense);
    const savedExpense = await expense.save();

    const user = await User.findById(userId);
    console.log(amount);
    const totalExpense = Number(user.totalExpense) + Number(amount);
    console.log(totalExpense);

    user.totalExpense = totalExpense;
    await user.save();

    res.status(201).json({ expense: savedExpense, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
};

const getExpenses = async (userId, page = 1, limit = 10) => {
  try {
    const expenses = await Expense.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
console.log(userId)
    return expenses;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const showExpenses = async (req, res) => {
  let { page, limit } = req.query;
  page = parseInt(page) || 1; // default to page 1 if page parameter is missing or not a number
  limit = parseInt(limit) || 10; // default to 10

  try {
    const token = req.header('Authorization');
    const decoded = jwt.verify(token, process.env.RAZORPAY_KEY_SECRET);
    const userId = decoded.userId;

    const expenses = await getExpenses(userId, page, limit);
console.log(expenses)
    const totalCount = await Expense.countDocuments({ user: userId });

    res.status(200).json({
      expenses,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteExpense = async (req, res) => {
  const expenseId = req.params.expenseId;
  console.log(expenseId)
  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }

    res.status(204).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};

const downloadExpenses = async (req, res) => {
  try {
    if (!req.user.ispremiumuser) {
      return res.status(401).json({ success: false, message: 'User is not a premium User' });
    }

    const bucketName = 'xpense-tracker'
    const fileKey = `expenses_${uuidv1()}.txt`;

    const expenses = await Expense.find({ user: req.user._id });

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: JSON.stringify(expenses),
    };

    await s3.upload(params).promise();

    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    res.status(201).json({ fileUrl, success: true });
  } catch (err) {
    res.status(500).json({ error: err, success: false, message: 'Something went wrong' });
  }
};

module.exports = {
  deleteExpense,
  showExpenses,
  addExpense,
  downloadExpenses,
};
