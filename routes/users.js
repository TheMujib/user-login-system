const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/login', function (req, res, next) {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('login', {
    title: 'Login',
    errorMessage: message,

    userInput: {
      email: '',
      password: '',
    },
  });
});

// Post Login
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  }),

  function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email, password);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: errors.array(),

        userInput: {
          email: email,
          password: password,
        },
      });
    }
  }
);

// Passport
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    function (username, password, done) {
      User.findOne({ email: username }, function (err, user, req) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            type: 'error',
            message: 'Invalid Email Address',
          });
        }

        bcrypt.compare(password, user.password, function (err, res) {
          if (err) return done(err);
          if (res === false)
            return done(null, false, {
              type: 'error',
              message: 'Incorrect password.',
            });

          return done(null, user);
        });
      });
    }
  )
);

// Get Sign Up
router.get('/register', function (req, res, next) {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('register', {
    title: 'Sign Up',
    errorMessage: message,

    userInput: {
      name: '',
      email: '',
      password: '',
      repass: '',
    },
  });
});

router.post(
  '/register',

  body('email')
    .isEmail()
    .notEmpty()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body(
    'password',
    'please enter a password with only numbers and text and at least 6 characters'
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
    .notEmpty(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),

  (req, res, next) => {
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPass = req.body.repassword;

    console.log(name);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.render('register', {
        title: 'Sign Up',
        errorMessage: errors.array(),

        userInput: {
          name: name,
          email: email,
          password: password,
          repass: req.body.confirmPass,
        },
      });
    }

    User.findOne({ $or: [{ username: name }, { email: email }] }).then(
      (user) => {
        if (user) {
          if (user.username === name) {
            req.flash('error', 'Username already exists.');
          } else {
            req.flash(
              'error',
              'E-Mail exists already, please pick a different one.'
            );
          }
          return res.redirect('/users/register');
        }

        return bcrypt
          .hash(password, 12)
          .then((hashPassword) => {
            const newUser = new User({
              username: name,
              email: email,
              password: hashPassword,
            });

            return newUser.save();
          })
          .then((result) => {
            console.log('User saved to DB', result);

            req.flash('success', 'You are now registered');
            res.redirect('/');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    );
  }
);

router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
