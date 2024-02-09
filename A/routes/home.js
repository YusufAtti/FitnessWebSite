var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Home Page' });

});

router.get('/about', function(req, res, next) {

  res.render('about', { title: 'About Page' });

});

router.get('/contact', function(req, res, next) {

  res.render('contact', { title: 'Contact Page' });

});

module.exports = router;
