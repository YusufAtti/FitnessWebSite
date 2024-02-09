var express = require('express');
var router = express.Router();
var userController = require('../controller/userController');
const passport = require('passport')
const firebase = require('../utility/firestore')
const bcrypt = require('bcryptjs')


function checkAuthenticated(req, res, next) {

  if (req.session.user) {
    return next()
  }

  res.redirect('/user/login')

}

function checkNotAuthenticated(req, res, next) {

  if (req.session.user) {

    res.redirect('/user')

  }

  next()

}

router.get('/tarihlerVeDatalar', async function(req, res, next) {
    
  await userController.tarihVeDatalar(req,res);

});

router.get('/', checkAuthenticated,  async function(req, res, next) {
    
  await userController.indexPage(req,res);

});

router.get('/beslenme', checkAuthenticated,  async function(req, res, next) {

  await userController.beslenmeGetir(req,res,next);

});

router.get('/sifreDegistirSayfasi',  async function(req, res, next) {

  res.render('user/sifreDegistir' , {title : "Şifre Değiştir"})

});

router.get('/antrenman', checkAuthenticated,  async function(req, res, next) {

  await userController.antrenmanGetir(req,res,next);

});

router.get('/login', checkNotAuthenticated,  function(req, res, next) {

  res.render('user/login', { title: 'Login Page' });

});

router.get('/logout', checkAuthenticated,  async function(req, res, next) {

  await req.session.destroy();
  res.redirect('/');

});

router.get('/profile', checkAuthenticated,  async function(req, res, next) {

  res.render('user/profile', {title : "Profile" , user : req.session.user})

});

router.get('/onayKoduEkrani', function(req, res, next) {

  res.render('onayKoduEkran', { title: 'Onay Ekrani' });

});


router.get('/register', function(req, res, next) {

  res.render('user/register', { title: 'Register Page' });

});

router.get('/forgot-password', function(req, res, next) {

  res.render('user/sifremiUnuttum', { title: 'Şifremi Unuttum' });

});

router.get('/onayEkrani', function(req, res, next) {

  res.render('user/onayKoduEkrani', { title: 'Onay Ekrani' });

});

router.get('/deleteRapor/:id', async function(req, res, next) {

  await userController.deleteRapor(req,res,next);

});


router.get('/message', async function(req, res, next) {

  
  await userController.mesajlariGetir(req,res,next);

});

//Post Request
router.post('/register', async function(req, res, next) {

  await userController.register(req,res,next);

});

router.post('/login', async (req, res) => {

  await userController.login(req,res);
  
});

router.post('/update', async (req, res) => {

  await userController.update(req,res);
  
});

router.post('/onayKoduGir', async function(req, res, next) {

  await userController.onayKoduGir(req,res);

});

router.post('/mesajGonder', async function(req, res, next) {

  await userController.mesajGonder(req,res);

});

router.post('/kodKontrol', async function(req, res, next) {

  await userController.kodKontrol(req,res);

});

router.post('/sifreDegistir',  async function(req, res, next) {

  await userController.sifreDegistir(req,res);

});

router.post('/raporEkle',  async function(req, res, next) {

  await userController.raporEkle(req,res);

});


module.exports = router;
