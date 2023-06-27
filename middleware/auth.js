const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {

    try {
        const token = req.header('authorization');
        console.log(token);
        const decodedToken = jwt.verify(token, process.env.RAZORPAY_KEY_SECRET);
        const userid = decodedToken.userId;
        User.findById(userid).then(user => {
            console.log(JSON.stringify(user));
            req.user = user;
            next();
        }).catch(err => { throw new Error(err)})

      } catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
        // err
      }

}

module.exports = {
    authenticate
}