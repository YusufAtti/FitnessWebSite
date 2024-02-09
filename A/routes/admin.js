var express = require('express');
var router = express.Router();
var adminController = require('../controller/adminController')


function checkAuthenticated(req, res, next) {

  if (req.session.admin) {
    return next()
  }

  res.redirect('/admin/login')

}

function checkNotAuthenticated(req, res, next) {

  if (req.session.admin) {

    res.redirect('/admin')

  }

  next()

}


//Get Req
router.get('/',checkAuthenticated, function(req, res, next) {

  res.redirect('admin/ptList');

});



router.get('/login', checkNotAuthenticated ,async function(req, res, next) {

  res.render('admin/login', {title : "Admin giriş"})

});

router.get('/mealList',checkAuthenticated , async function(req, res, next) {

  await adminController.getMealList(req,res,next);

});


router.get('/userList', checkAuthenticated, async function(req, res, next) {

  await adminController.getUserList(req,res,next);

});

router.get('/ptList', checkAuthenticated, async function(req, res, next) {

  await adminController.getPtList(req,res,next);

});

router.get('/hareket',  checkAuthenticated , async function(req, res, next) {

  await adminController.hareket(req,res,next);

});

router.get('/deleteMeal/:id', checkAuthenticated, async function(req, res, next) {

  await adminController.deleteMeal(req,res,next);

});

router.get('/deleteUser/:id', checkAuthenticated, async function(req, res, next) {

  await adminController.deleteUser(req,res,next);

});

router.get('/deletePt/:id',checkAuthenticated , async function(req, res, next) {

  await adminController.deletePt(req,res,next);
});

router.get('/bosaAl/:id',checkAuthenticated , async function(req, res, next) {

  await adminController.bosaAl(req,res,next);

});

router.get('/aktifPasifEt/:id', checkAuthenticated ,async function(req, res, next) {

  await adminController.aktifPasif(req,res,next);
  
});

router.get('/aktifPasifEtUser/:id', checkAuthenticated, async function(req, res, next) {

  await adminController.aktifPasifUser(req,res,next);
  
});

router.get('/updateUser/:id',checkAuthenticated,  async function(req, res, next) {

  await adminController.updateUserPageGetir(req,res,next);
  
});

router.get('/updatePt/:id',  checkAuthenticated, async function(req, res, next) {

  await adminController.updatePtPageGetir(req,res,next);
  
});


router.get('/deleteHareket/:id',checkAuthenticated, async function(req, res, next) {

  await adminController.deleteHareket(req,res,next);

});

router.get('/atama', checkAuthenticated ,async function(req, res, next) {

  await adminController.getAtama(req,res,next);

});

//Post Req

router.post('/addMeal', checkAuthenticated, async function(req, res, next) {

  await adminController.addMeal(req,res,next);
});

router.post('/addHareket', checkAuthenticated ,async function(req, res, next) {

  await adminController.addHareket(req,res,next);
  
});

router.post('/addUser',checkAuthenticated , async function(req, res, next) {

  await adminController.addUser(req,res,next);

});

router.post('/addPt', checkAuthenticated ,async function(req, res, next) {

  await adminController.addPt(req,res,next);

});

router.post('/atama',checkAuthenticated , async function(req, res, next) {

  await adminController.atama(req,res,next);
  
});

router.post('/updateUser',checkAuthenticated, async function(req, res, next) {

  await adminController.updateUser(req,res,next);

});

router.post('/updatePt',checkAuthenticated , async function(req, res, next) {

  await adminController.updatePt(req,res,next);

});

router.post('/login', async function(req, res, next) {

  await adminController.login(req,res,next)


});



module.exports = router;
