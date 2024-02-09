var express = require('express');
var router = express.Router();
var helper = require('../helper/firebaseHelper')
var ptController = require('../controller/ptController')


function checkAuthenticated(req, res, next) {

  if (req.session.pt) {
    return next()
  }

  res.redirect('/pt/login')

}

function checkNotAuthenticated(req, res, next) {

  if (req.session.pt) {

    res.redirect('/pt')

  }

  next()

}

/* GET pt listing. */
router.get('/', checkAuthenticated, function(req, res, next) {

  res.render('pt/index', { title: 'PT' , pt : req.session.pt });

});

router.get('/login', checkNotAuthenticated, function(req, res, next) {

  res.render('pt/login', { title: 'Login' });

});

router.get('/register', function(req, res, next) {

  res.render('pt/register', { title: 'Register' });

});

router.get('/profile', checkAuthenticated,  async function(req, res, next) {

  res.render('pt/profile', {title : "Profile" , pt : req.session.pt})

});

router.get('/logout', checkAuthenticated,  async function(req, res, next) {

  await req.session.destroy();
  res.redirect('/');

});

router.get('/beslenmeGoster/:id', async function(req, res, next) {

  await ptController.beslenmeGetir(req,res,next);

});

router.get('/raporGetir', async function(req, res, next) {

  await ptController.raporGetir(req,res,next);

});

router.get('/antrenmanGoster/:id', async function(req, res, next) {

  await ptController.antrenmanGetir(req,res,next);
  
});

router.get('/mesajlariGetir/:id', async function(req, res, next) {

  await ptController.mesajlariGetir(req,res,next);
  
});

router.get('/deleteOgunItem/:id', async function(req, res, next) {

  await ptController.deleteOgunItem(req,res,next);
});

router.get('/deleteAntrenmanItem/:id', async function(req, res, next) {

  await ptController.deleteAntrenmanItem(req,res,next);
});

router.get('/raporSayfasiGetir/:id', async function(req, res, next) {

  await ptController.raporSayfasiGetir(req,res,next);
  
});

router.post('/update', async (req, res) => {

  await ptController.update(req,res);
  
});


router.get('/danisanlarim', checkAuthenticated, async function(req, res, next) {

 await ptController.danisanlarim(req,res);

});

router.get('/beslenmeEkle', checkAuthenticated, async function(req, res, next) {

  await ptController.beslenmeEkle(req,res);
 
 });

 router.get('/antrenmanEkle', checkAuthenticated, async function(req, res, next) {

  await ptController.antrenmanEkleGetir(req,res);
 
 });



/* POST pt listing. */
router.post('/register', async function(req, res, next) {

  await ptController.register(req,res,next);

});

router.post('/login', async function(req, res, next) {

  await ptController.login(req,res,next);

});

router.post('/mesajGonder', async function(req, res, next) {

  await ptController.mesajGonder(req,res);

});

router.post('/ogunEkle', async function(req, res, next) {

  await ptController.ogunEkle(req,res);

});

router.post('/antrenmanEkle', async function(req, res, next) {

  await ptController.antrenmanEkle(req,res);

});





module.exports = router;
