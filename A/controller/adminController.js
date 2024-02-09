let adminController = {}
const firebase = require('../utility/firestore');
const bcrypt = require('bcryptjs');
const helper = require('../helper/firebaseHelper')
const mailHelper = require('../helper/mailHelper')
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');


adminController.getProfilePage = async function (ctx, next) {



}

adminController.aktifPasif = async function (req, res) {

    try {

        newValues = {

            aktifMi: 0

        }

        let user = await helper.getDataById(req.params.id, "pt")

        if (user != null) {

            if (user.aktifMi == 0) {

                newValues.aktifMi = 1

            }

            let rs = await helper.updateOneField(req.params.id, newValues, "pt");


            if (rs.onay == 1) {

                if (newValues.aktifMi == 1) {
                    req.flash("flashSuccess", "Kullanıcı Aktif Duruma Alındı")
                    res.redirect('/admin/ptList')
                } else {
                    req.flash("flashSuccess", "Kullanıcı Pasif Duruma Alındı")
                    res.redirect('/admin/ptList')
                }

            } else {

                req.flash("flashError", "Bir sıkıntı oldu.")
                res.redirect('/admin/ptList')

            }

        }


    } catch (error) {

        console.log("Error : ", error);

    }

}

adminController.aktifPasifUser = async function (req, res) {

    try {

        newValues = {

            aktifMi: 0

        }

        let user = await helper.getDataById(req.params.id, "users")

        if (user != null) {

            if (user.aktifMi == 0) {

                newValues.aktifMi = 1


            }

            let rs = await helper.updateOneField(req.params.id, newValues, "users");


            if (rs.onay == 1) {

                if (newValues.aktifMi == 1) {
                    req.flash("flashSuccess", "Kullanıcı Aktif Duruma Alındı")
                    res.redirect('/admin/userList')
                } else {
                    req.flash("flashSuccess", "Kullanıcı Pasif Duruma Alındı")
                    res.redirect('/admin/userList')
                }



            } else {

                req.flash("flashError", rs.message)
                res.redirect('/admin/userList')

            }

        }


    } catch (error) {

        console.log("Error : ", error);

    }

}


adminController.addMeal = async function (req, res, next) {

    try {

        let meal = {
            name: req.body.mealName,
            calori: req.body.calori,
            description: req.body.description
        }

        let rs = await helper.insertObject(meal, "meal")

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/mealList')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/mealList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.addHareket = async function (req, res, next) {

    try {

        let hareket = {
            name: req.body.hareketAdi,
            picture: req.body.picture,
            description: req.body.description,
            videoLink: req.body.videoLink
        }

        let rs = await helper.insertObject(hareket, "hareketler")

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/hareket')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/hareket')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.addPt = async function (req, res, next) {
    try {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('Yüklenecek dosya bulunamadı.');
        } else {

            const hashSifre = await bcrypt.hash(req.body.password, 10);

            const resimDosyasi = req.files.picture;

            // İlgili dosyayı istediğiniz yola kaydedebilirsiniz
            resimDosyasi.mv('public/images/' + resimDosyasi.name, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }

            });

            let pt = {

                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashSifre,
                gender: req.body.gender,
                birthday: req.body.birthday,
                gsm: req.body.gsm,
                picture: '/images/' + resimDosyasi.name,
                talent: req.body.talent,
                aktifMi: 1

            }

            let rs = await helper.insertObject(pt, "pt")


            if (rs.error == 0) {

                req.flash("flashSuccess", rs.message)
                res.redirect('/admin/ptList')

            } else {

                req.flash("errorFlash", rs.message)
                res.redirect('/admin/ptList')

            }

        }


    } catch (error) {

        console.log(error);

    }


}

adminController.addUser = async function (req, res, next) {

    try {

        const hashSifre = await bcrypt.hash(req.body.password, 10);

        let user = {

            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashSifre,
            gender: req.body.gender,
            birthday: req.body.birthday,
            gsm: req.body.gsm,
            picture: req.body.picture,
            goal: req.body.goal

        }

        let rs = await helper.insertObject(user, "users");

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/userList')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/userList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.getMealList = async function (req, res, next) {

    try {

        const meals = await helper.getByCollection("meal")

        res.render('admin/mealList', {
            title: "Meal List",
            meals: meals
        })

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.getUserList = async function (req, res, next) {

    try {

        let users = await helper.getByCollection("users")

        res.render('admin/userList', {
            title: "Users List",
            users: users
        })


    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.getPtList = async function (req, res, next) {

    try {

        let pts = await helper.getByCollection("pt")

        res.render('admin/ptList', {
            title: "Pt List",
            pts: pts
        })


    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.hareket = async function (req, res, next) {

    try {

        let hareketler = await helper.getByCollection("hareketler")

        res.render('admin/hareket', {
            title: "Hareket Listesi",
            hareketler: hareketler
        })


    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.deleteMeal = async function (req, res, next) {

    try {

        let rs = await helper.deleteById(req.params.id, "meal")

        if (rs == 1) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/mealList')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/mealList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.deleteUser = async function (req, res, next) {

    try {

        let rs = await helper.deleteById(req.params.id, "users");

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/userList')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/userList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.deletePt = async function (req, res, next) {

    try {

        let rs = await helper.deleteById(req.params.id, "pt");

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/ptList')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/ptList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}
adminController.bosaAl = async function (req, res, next) {

    try {

        let danisanPt = await helper.getDataByField("userId", req.params.id , "danisanPt")

        let rs = await helper.deleteById(danisanPt[0].id, "danisanPt");

        if (rs.error == 0) {
            req.flash("flashSuccess", "Danışan atama geri alındı.")
            res.redirect('/admin/userList')
        } else {
            req.flash("flashError", "Danışan atama geri alınamadi.")
            res.redirect('/admin/userList')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.deleteHareket = async function (req, res, next) {

    try {

        let rs = await helper.deleteById(req.params.id, "hareketler");

        if (rs.error == 0) {
            req.flash("flashSuccess", rs.message)
            res.redirect('/admin/hareket')
        } else {
            req.flash("flashError", rs.message)
            res.redirect('/admin/hareket')
        }

    } catch (error) {

        console.log("Error : ", error.message);

    }

}

adminController.atama = async function (req, res, next) {

    try {

        var userId = req.body.userId;
        var ptId = req.body.ptId;

        let rs = await helper.getDataByField("userId", userId, "danisanPt");
        

        console.log("Rs : ", rs);

        if (rs.length == 0) {

            let pt = await helper.getDataByField("ptId", ptId, "danisanPt");
            const ptProfile = await helper.getDataById(ptId , "pt")

            if (pt.length >= 5 || ptProfile.aktifMi == 0) {

                req.flash("flashError", "Pt Kontenjanı Dolu Veya Pt Aktif Değil")
                res.redirect('/admin/atama')
                
            } else {

                let danisanPt = {

                    userId: userId,
                    ptId: ptId

                }

                let rs = await helper.insertObject(danisanPt, "danisanPt");

                if (rs.error == 0) {
                    req.flash("flashSuccess", rs.message)
                    res.redirect('/admin/atama')
                } else {
                    req.flash("flashError", rs.message)
                    res.redirect('/admin/atama')
                }
            }



        } else {

            req.flash("flashError", "Danışan Başka Bir Pt'den destek Alıyor. ")
            res.redirect('/admin/atama')

        }



    } catch (error) {

        console.log("Error : ", error);

    }

}

adminController.getAtama = async function (req, res, next) {

    try {

        let users = await helper.getByCollection("users");
        let pts = await helper.getByCollection("pt");

        res.render('admin/atama', {
            title: "Atama",
            users: users,
            pts: pts
        });


    } catch (error) {

    }

}

adminController.updateUser = async function (req,res,next) {

    try {

        const fullname = req.body.fullname;
        const [name, surname] = fullname.split(' ');
        const userId = req.body.userId
    
        console.log("User Id : " , userId);

        updateFields = {
    
          name: name,
          surname: surname,
          gsm: req.body.gsm,
          gender: req.body.gender,
          birthday: req.body.birthday,
          email: req.body.email,
    
        }
    
        let rs = await helper.updateOneField(userId, updateFields, "users")
    
        if (rs.onay == 1) {
    
          req.flash("flashSuccess", rs.message)
          res.redirect('/admin/updateUser/' + userId)
    
        } else {
    
          req.flash("flashError", rs.message)
          res.redirect('/admin/updateUser/' + userId)
    
        }
    
      } catch (error) {
    
        console.log(error);
    
      }
    


}

adminController.updatePt = async function (req,res,next) {

    try {

        const fullname = req.body.fullname;
        const [name, surname] = fullname.split(' ');
        const ptId = req.body.ptId
    

        updateFields = {
    
          name: name,
          surname: surname,
          gsm: req.body.gsm,
          gender: req.body.gender,
          birthday: req.body.birthday,
          email: req.body.email,
    
        }
    
        let rs = await helper.updateOneField(ptId, updateFields, "pt")
    
        if (rs.onay == 1) {
    
          req.flash("flashSuccess", rs.message)
          res.redirect('/admin/updatePt/' + ptId)
    
        } else {
    
          req.flash("flashError", rs.message)
          res.redirect('/admin/updatePt/' + ptId)
    
        }
    
      } catch (error) {
    
        console.log(error);
    
      }
    


}

adminController.updateUserPageGetir = async function (req,res,next) {

    try {

        userId = req.params.id

        const user = await helper.getDataById(userId , "users");

        console.log("User : ", user);

        res.render('admin/adminUserGuncelle' , {title : "User Update" , user : user})
    
      } catch (error) {
    
        console.log(error);
    
      }
    


}


adminController.updatePtPageGetir = async function (req,res,next) {

    try {

        ptId = req.params.id

        const pt = await helper.getDataById(ptId , "pt");


        res.render('admin/adminPtGuncelle' , {title : "pt Update" , pt : pt})
    
      } catch (error) {
    
        console.log(error);
    
      }
    


}

adminController.login = async function (req, res) {

    try {
  
      const userQuery = await firebase.collection('admin').where('email', '==', req.body.email).limit(1).get();
  
      if (userQuery.empty) {
  
        req.flash("flashError", "E-posta adresi bulunamadi.")
        res.redirect('/admin/login')
  
      } else {
  
  
        const userData = userQuery.docs[0].data();
        userData.userId = userQuery.docs[0].id
        const hashedPassword = userData.password;
  
        if (userData.aktifMi == 0) {
          req.flash("flashError", 'Kullanıcı Pasif Durumda. Adminle İletişime Geçiniz.')
          res.redirect('/admin/login')
        } else {
  
          // Hash'lenmiş şifreleri karşılaştır
          const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);
  
          if (passwordMatch) {
  
            try {
  
              req.session.admin = userData;
              req.flash("flashSuccess", "Giriş Yapıldı")
              res.redirect('/admin')
  
            } catch (error) {
  
              console.log("Error :", error);
  
            }
  
  
          } else {
  
            req.flash("flashError", 'E-posta adresi veya şifre hatalı')
            res.redirect('/admin/login')
  
          }
  
        }
  
  
  
      }
  
  
  
    } catch (error) {
  
      req.flash("flashError", 'Oturum açma başarısız')
      res.redirect('/user/login')
  
    }
  
  }


module.exports = adminController