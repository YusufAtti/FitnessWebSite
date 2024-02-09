let userController = {}
const firebase = require('../utility/firestore');
const bcrypt = require('bcryptjs');
const helper = require('../helper/firebaseHelper')
const mailHelper = require('../helper/mailHelper')
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

function generateRandomCode() {
  const length = 6;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

userController.getProfilePage = async function (req, res, next) {


}

userController.register = async function (req, res, next) {


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

      let user = {

        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: hashSifre,
        gender: req.body.gender,
        birthday: req.body.birthday,
        gsm: req.body.gsm,
        picture: '/images/' + resimDosyasi.name,
        goal: req.body.goal,
        aktifMi: 1
      }

      let rs = await helper.insertObject(user, "users");


      if (rs.error == 0) {

        req.flash("flashSuccess", rs.message)
        res.redirect('/user')

      } else {

        req.flash("errorFlash", rs.message)
        res.redirect('/user/register')

      }

    }

  } catch (error) {

    console.log(error);

  }

}

userController.login = async function (req, res) {

  try {

    const userQuery = await firebase.collection('users').where('email', '==', req.body.email).limit(1).get();

    if (userQuery.empty) {

      req.flash("flashError", "E-posta adresi bulunamadi.")
      res.redirect('/user/login')

    } else {


      const userData = userQuery.docs[0].data();
      userData.userId = userQuery.docs[0].id
      const hashedPassword = userData.password;

      if (userData.aktifMi == 0) {
        req.flash("flashError", 'Kullanıcı Pasif Durumda. Adminle İletişime Geçiniz.')
        res.redirect('/user/login')
      } else {

        // Hash'lenmiş şifreleri karşılaştır
        const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

        if (passwordMatch) {

          try {

            req.session.user = userData;
            req.flash("flashSuccess", "Giriş Yapıldı")
            res.redirect('/user')

          } catch (error) {

            console.log("Error :", error);

          }


        } else {

          req.flash("flashError", 'E-posta adresi veya şifre hatalı')
          res.redirect('/user/login')

        }

      }



    }



  } catch (error) {

    req.flash("flashError", 'Oturum açma başarısız')
    res.redirect('/user/login')

  }

}

userController.update = async function (req, res, next) {


  try {

    const fullname = req.body.fullname;
    const [name, surname] = fullname.split(' ');
    var userId;
    if (req.session.user.userId) {

      userId = req.session.user.userId

    }

    updateFields = {

      name: name,
      surname: surname,
      gsm: req.body.gsm,
      gender: req.body.gender,
      birthday: req.body.birthday,
      email: req.body.email,

    }

    let rs = await helper.updateOneField(userId, updateFields, "users")

    // let rs = await User.updateUserById(userId, updateFields);

    if (rs.onay == 1) {

      req.flash("flashSuccess", rs.message)
      req.session.user = rs.data
      req.session.user.userId = userId
      res.redirect('/user/profile')

    } else {

      req.flash("flashError", rs.message)
      res.redirect('/user/profile')

    }


  } catch (error) {

    console.log(error);

  }

}

userController.beslenmeGetir = async function (req, res, next) {

  try {

    id = req.session.user;
    userId = id["userId"]

    let filtre = {

      userId: userId,

    }
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    let ogunler = await helper.getDataByObject(filtre, "danisanOgunleri");
    let yemekler = await helper.getByCollection("meal");

    console.log("Yemekler : ", yemekler);

    ogunler.forEach(element => {

      const [year, month, day] = element.tarih.split('-');
      const date = new Date(year, month - 1, day);
      element.gun = days[date.getDay()];

      if (element.Sabah) {

        for (let index = 0; index < element.Sabah.length; index++) {

          yemekler.forEach(yemek => {

            if (yemek.id == element.Sabah[index]) {

              console.log("Girdimmm");
              element.Sabah[index] = yemek.name + "   =>   " + yemek.calori + " Kalori"

            }

          });

        }

      }

      if (element.Oglen) {

        for (let index = 0; index < element.Oglen.length; index++) {

          yemekler.forEach(yemek => {

            if (yemek.id == element.Oglen[index]) {

              console.log("Girdimmm");
              element.Oglen[index] = yemek.name + "   =>   " + yemek.calori + " Kalori"

            }

          });

        }

      }

      if (element.Aksam) {

        for (let index = 0; index < element.Aksam.length; index++) {

          yemekler.forEach(yemek => {

            if (yemek.id == element.Aksam[index]) {

              console.log("Girdimmm");
              element.Aksam[index] = yemek.name + "   =>   " + yemek.calori + " Kalori"

            }

          });

        }

      }

    });



    console.log("Ogunler : ", ogunler);

    ogunler.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihA - tarihB;
    });

    res.render('user/beslenme', {
      title: 'Beslenme',
      user: req.session.user,
      ogunler: ogunler
    });


  } catch (error) {

    console.log("Error : ", error);

  }




}

userController.antrenmanGetir = async function (req, res, next) {

  try {

    id = req.session.user;
    userId = id["userId"]

    let filtre = {

      userId: userId,

    }
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    let antrenmanlarProgramlari = await helper.getDataByObject(filtre, "antrenmanlarProgramlari");

    antrenmanlarProgramlari.forEach(element => {

      const [year, month, day] = element.tarih.split('-');
      const date = new Date(year, month - 1, day);
      element.gun = days[date.getDay()];

    });

    console.log("antrenmanlarProgramlari", antrenmanlarProgramlari);
    console.log("antrenmanlarProgramlari", antrenmanlarProgramlari[0].hareketler);

    antrenmanlarProgramlari.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihA - tarihB;
    });

    res.render('user/antrenman', {
      title: 'Antrenman',
      antrenmanlarProgramlari: antrenmanlarProgramlari
    });


  } catch (error) {

    console.log("Error : ", error);

  }




}

userController.onayKoduGir = async function (req, res) {

  try {

    email = req.body.email;

    let user = await helper.getDataByField("email", email, "users");

    if (user.length != 0) {

      const randomCode = generateRandomCode();
      user[0].onayKodu = randomCode;

      let rs = await helper.updateOneField(user[0].id, user[0], "users");

      if (rs.onay == 1) {

        const emailTemplatePath = path.join(__dirname, '..', 'views', 'mailHtml.ejs');

        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

        const renderedEmail = ejs.render(emailTemplate, {
          name: user[0].name,
          surname: user[0].surname,
          kod: randomCode
        });

        const toEmail = email; // Alıcı e-posta adresi
        const subject = 'Sifre Degistirme Mail'; // E-posta konusu
        const message = renderedEmail; // E-posta içeriği

        await mailHelper.sendEmail(toEmail, subject, message);

        res.send({
          error: 0,
          mail: email
        })


      } else {

        res.send({
          error: 0,
          message: rs.message,
          mail: email
        })

      }

    } else {

      console.log("Mail adresine kayitli kullanici yok");
      res.send({
        error: 0,
        data: "Mail adresine kayitli kullanici yok"
      })

    }


  } catch (error) {

    console.log("Error : ", error.message);

  }

}

userController.kodKontrol = async function (req, res) {

  try {

    console.log("Onay Kodu : ", req.body.onayKodu);
    console.log("Email : ", req.body.email);

    const user = await helper.getDataByField("email", req.body.email, "users");

    if (user[0].onayKodu == req.body.onayKodu) {

      req.flash("flashSuccess", "Kod Doğru Şifrenizi Değiştirebilirsiniz.")
      res.send({
        redirectURL: `/user/sifreDegistirSayfasi?userId=${user[0].id}`
      })

    } else {
      req.flash("errorFlash", "Kod Yanlis")
      res.send({
        redirectURL: '/user'
      })

    }

  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.sifreDegistir = async function (req, res) {

  try {


    console.log("Yeni Sifre : ", req.body.newPassword);

    let user = await helper.getDataById(req.body.userId, "users");

    console.log("User : ", user);

    if (user != null) {

      const hashSifre = await bcrypt.hash(req.body.newPassword, 10);

      newValues = {
        password: hashSifre
      }

      let rs = await helper.updateOneField(req.body.userId, newValues, "users")
      if (rs.onay == 1) {

        req.flash("flashSuccess", "Şifreniz guncellendi")
        res.send({
          redirectURL: '/user/login'
        })

      } else {

        req.flash("flashError", "Sifreniz Guncellenemedi")
        res.send({
          redirectURL: '/user/forgot-password'
        })

      }

    } else {

      req.flash("flashError", "Kullanıcı Bulunamadi")
      res.send({
        redirectURL: '/user/forgot-password'
      })

    }





  } catch (error) {

    console.log("Error : ", error);

  }


}

userController.indexPage = async function (req, res) {

  try {

    let raporlar = await helper.getDataByField("userId", req.session.user.userId, "raporlar");
    let tarihler = []


    raporlar.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihB - tarihA;
    });

    raporlar.forEach(element => {

      tarihler.push(element.tarih)

    });

    res.render('user/index', {
      title: 'User',
      raporlar: raporlar,
      tarihler: tarihler
    });


  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.tarihVeDatalar = async function (req, res) {

  try {

    let raporlar = await helper.getDataByField("userId", req.session.user.userId, "raporlar");
    let tarihler = []
    let kasOranlari = []
    let yagOranlari = []
    let kilolar = []


    raporlar.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihB - tarihA;
    });

    raporlar.forEach(element => {

      tarihler.push(element.tarih)
      kasOranlari.push(element.kasOrani)
      yagOranlari.push(element.yagOrani)
      kilolar.push(element.kilo)

    });

    let data = {

      tarihler: tarihler,
      kasOranlari: kasOranlari,
      yagOranlari: yagOranlari,
      kilolar: kilolar

    }

    res.send(data)

  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.raporEkle = async function (req, res) {

  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('Yüklenecek dosya bulunamadı.');
    } else {

      const resimDosyasi = req.files.picture;

      // İlgili dosyayı istediğiniz yola kaydedebilirsiniz
      resimDosyasi.mv('public/images/' + resimDosyasi.name, (err) => {
        if (err) {
          return res.status(500).send(err);
        }

      });

      rapor = {

        userId: req.session.user.userId,
        kilo: req.body.kilo,
        yagOrani: req.body.yagOrani,
        kasOrani: req.body.kasOrani,
        tarih: req.body.tarih,
        picture: '/images/' + resimDosyasi.name
  
      }
  
      let rs = await helper.insertObject(rapor, "raporlar")
  
      if (rs.error == 0) {
  
        req.flash("flashSuccess", rs.message)
        res.redirect('/user')
  
      } else {
  
        req.flash("errorFlash", rs.message)
        res.redirect('/user')
  
      }


    }

    


  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.mesajGonder = async function (req, res) {

  try {

    filtre2 = {

      userId: req.session.user.userId

    }

    let danisanPt = await helper.getDataByObject(filtre2, "danisanPt")

    mesaj = {

      alıcı: danisanPt[0].ptId,
      gonderici: req.session.user.userId,
      message: req.body.message,
      tarih: req.body.tarih

    }

    console.log("Mesaj : " , mesaj);

    let rs = await helper.insertObject(mesaj, "messages")

    if (rs.error == 0) {

      res.send({
        redirectURL: '/user/message'
      })

    } else {

      res.send({
        redirectURL: '/user/message'
      })

    }


  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.mesajlariGetir = async function (req, res) {

  try {

   
    filtre2 = {

      userId: req.session.user.userId

    }

    let danisanPt = await helper.getDataByObject(filtre2, "danisanPt")

    gonderdigimMesajlarFiltre = {

      gonderici: req.session.user.userId,
      alıcı : danisanPt[0].ptId

    }

    
    let gonderilenMesajlar = await helper.getDataByObject(gonderdigimMesajlarFiltre, "messages")

    gonderilenMesajlar.forEach(element => {
      element.sag = 1;
    });

    gelenMesajlarFiltre = {

      alıcı: req.session.user.userId,
      gonderici : danisanPt[0].ptId

    }

    let gelenMesajlar = await helper.getDataByObject(gelenMesajlarFiltre, "messages")

    gelenMesajlar.forEach(element => {
      element.sag = 0;
    });

    console.log("Gelen mesajlar : " , gelenMesajlar);

    let birlesmisMesajlar = gonderilenMesajlar.concat(gelenMesajlar);

    // Tarihe göre sıralama
    birlesmisMesajlar.sort((a, b) => {
      const dateA = new Date(a.tarih);
      const dateB = new Date(b.tarih);
      return dateA - dateB;
    });

    console.log("Birleşmiş Mesajlar : " , birlesmisMesajlar);

    res.render('user/message', {
      title: 'Mesajlaşma',
      benimYolladiklarim: birlesmisMesajlar
    });
    


  } catch (error) {

    console.log("Error : ", error);

  }

}

userController.deleteRapor = async function(req,res) {

  try {

    let rs = await helper.deleteById(req.params.id , "raporlar")

    if(rs.error == 0){

        req.flash("flashSuccess", rs.message)
        res.redirect('/user')
  
      } else {
  
        req.flash("errorFlash", rs.message)
        res.redirect('/user')
  
      }

    }

  catch (error) {
    
  }


}


module.exports = userController