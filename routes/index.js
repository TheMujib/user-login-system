const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', checkAuthentication, function (req, res, next) {
  let message = req.flash('success');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const id = req.user.username;

  res.render('index', { title: 'Home', errorMessage: message, username: id });
});

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
