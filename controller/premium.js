const Expense = require('../models/expense');
const User = require('../models/user');

exports.leaderboard = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'expenses',
          localField: '_id',
          foreignField: 'user',
          as: 'expenses'
        }
      },
      {
        $project: {
          name: 1,
          totalExpense: { $sum: '$expenses.amount' }
        }
      },
      {
        $sort: { totalExpense: -1 }
      }
    ]);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};
