const Razorpay = require('razorpay');
const Order = require('../models/orders');
const Purchase = require('../models/orders'); 
const User = require('../models/user');

exports.purchasepremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 200;

    const order = await rzp.orders.create({ amount, currency: "INR" });
console.log(order.id)
    const purchaseData = { 
      orderid: order.id,
      status: 'PENDING',
      user: req.user._id
    };

    await Order.create(purchaseData);

    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error creating order" });
  }
};


exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    const order = await Order.findOne({ orderid: order_id });
    console.log(order_id)
    if (!order) {
      throw new Error('Order not found');
    }

    order.orderid = payment_id;
    order.status = 'SUCCESSFUL';

    await order.save();
console.log(req.user)
    req.user.isPremium = true;
    await req.user.save();

    return res.status(202).json({ success: true, message: 'Transaction Successful' });
  } catch (err) {
    console.log(err);
    res.status(403).json({ error: err, message: 'Something went wrong' });
  }
};
