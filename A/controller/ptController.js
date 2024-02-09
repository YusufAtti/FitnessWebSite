let ptController = {}
const helper = require('../helper/firebaseHelper');
const firebase = require('../utility/firestore');
const bcrypt = require('bcryptjs');
const moment = require('moment');



ptController.register = async function (req, res) {

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

      const hashSifre = await bcrypt.hash(req.body.password, 10);

      let pt = {
  
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: hashSifre,
        gender: req.body.gender,
        birthday: req.body.birthday,
        gsm: req.body.gsm,
        picture: '/images/' + resimDosyasi.name,
        talent: req.body.talent
  
      }
  
      let rs = await helper.insertObject(pt, "pt");
  
      if (rs.error == 0) {
  
        req.flash("flashSuccess", rs.message)
        res.redirect('/pt')
  
      } else {
  
        req.flash("errorFlash", rs.message)
        res.redirect('/pt/register')
  
      }


    }



    

  } catch (error) {

    console.log(error);

  }

}

ptController.login = async function (req, res) {

  try {

    const ptQuery = await firebase.collection('pt').where('email', '==', req.body.email).limit(1).get();

    if (ptQuery.empty) {

      req.flash("flashError", "E-posta adresi bulunamadi.")
      res.redirect('/pt/login')

    } else {

      const ptData = ptQuery.docs[0].data();
      ptData.userId = ptQuery.docs[0].id
      const hashedPassword = ptData.password;

      if (ptData.aktifMi == 0) {

        req.flash("flashError", 'Hesabınız pasif durumda.')
        res.redirect('/pt/login')

      } else {
        const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

        if (passwordMatch) {

          try {
            req.session.pt = ptData;
            req.flash("flashSuccess", "Giriş Yapıldı")
            res.redirect('/pt')

          } catch (error) {

            console.log("Error :", error);

          }


        } else {
          req.flash("flashError", 'E-posta adresi veya şifre hatalı')
          res.redirect('/pt/login')

        }
      }


    }



  } catch (error) {

    req.flash("flashError", 'Oturum açma başarısız')
    res.redirect('/user/login')

  }

}

ptController.danisanlarim = async function (req, res) {

  try {

    id = req.session.pt;
    let users = await helper.getByCollection("users");
    let danisanPt = await helper.getDataByField('ptId', id["userId"], "danisanPt")

    danisanPt.forEach(element => {

      users.forEach(user => {

        if (element.userId == user.id) {
          const currentDate = moment();
          const dob = moment(user.birthday);
          element.danisan = user;
          element.danisan.age = currentDate.diff(dob, 'years');
        }

      });

    });

    console.log("dnisanlar : ", danisanPt);

    res.render('pt/danisanlarim', {
      title: "Danisanlarim",
      danisanlar: danisanPt
    })

  } catch (error) {

    console.log("Error : ", error.message);

  }


}

ptController.antrenmanGetir = async function (req, res, next) {

  try {

    userId = req.params.id;

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


    antrenmanlarProgramlari.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihA - tarihB;
    });

    res.render('pt/antrenmanGoster', {
      title: 'Antrenman',
      antrenmanlarProgramlari: antrenmanlarProgramlari
    });


  } catch (error) {

    console.log("Error : ", error);

  }




}


ptController.beslenmeEkle = async function (req, res) {

  try {

    id = req.session.pt;
    let users = await helper.getByCollection("users");
    let danisanPt = await helper.getDataByField('ptId', id["userId"], "danisanPt")
    let meals = await helper.getByCollection('meal')

    danisanPt.forEach(element => {

      users.forEach(user => {

        if (element.userId == user.id) {
          element.danisan = user;
        }

      });

    });

    res.render('pt/beslenmeProgramiEkle', {
      title: "Danisanlarim",
      danisanlar: danisanPt,
      meals: meals
    })

  } catch (error) {

    console.log("Error : ", error.message);

  }



}

ptController.antrenmanEkleGetir = async function (req, res) {

  try {

    id = req.session.pt;
    let users = await helper.getByCollection("users");
    let danisanPt = await helper.getDataByField('ptId', id["userId"], "danisanPt")
    let hareketler = await helper.getByCollection("hareketler")
    danisanPt.forEach(element => {

      users.forEach(user => {

        if (element.userId == user.id) {
          element.danisan = user;
        }

      });

    });

    res.render('pt/antrenmanEkle', {
      title: "Antrenman Ekle",
      danisanlar: danisanPt,
      hareketler: hareketler

    })

  } catch (error) {

    console.log("Error : ", error.message);

  }



}

ptController.ogunEkle = async function (req, res) {

  try {

    console.log("Req Body : ", req.body);

    id = req.session.pt;
    ptId = id["userId"];
    userId = req.body.data.userId;
    tarih = req.body.data.tarih;
    ogunZamani = req.body.data.ogunAdi;
    yemekler = req.body.data.yemekler;

    let filtre = {

      tarih: req.body.data.tarih,
      userId: userId,
      ptId: ptId,

    }

    let tariheGoreOgunGetir = await helper.getDataByObject(filtre, "danisanOgunleri")
    if (tariheGoreOgunGetir.length != 0) {

      if (!Array.isArray(tariheGoreOgunGetir[0][ogunZamani])) {
        tariheGoreOgunGetir[0][ogunZamani] = [];
      }

      tariheGoreOgunGetir[0][ogunZamani] = yemekler;

      let rs = await helper.updateOneField(tariheGoreOgunGetir[0].id, tariheGoreOgunGetir[0], "danisanOgunleri");

      if (rs.onay == 1) {

        req.flash("flashSuccess", "Öğün Eklendi.")
        res.send({
          redirectURL: '/pt/beslenmeEkle?onaylandi'
        })

      } else {

        req.flash("errorFlash", "Öğün Eklenemedi.")
        res.send({
          redirectURL: '/pt/beslenmeEkle?onaylandi'
        })

      }

    } else {

      danisanOgunleri = {

        ptId: ptId,
        userId: userId,
        tarih: tarih,
        [ogunZamani]: yemekler

      }

      let rs = await helper.insertObject(danisanOgunleri, "danisanOgunleri");

      if (rs.error == 0) {

        req.flash("flashSuccess", rs.message)
        res.send({
          redirectURL: '/pt/beslenmeEkle?onaylandi'
        })

      } else {

        req.flash("errorFlash", rs.message)
        res.send({
          redirectURL: '/pt/beslenmeEkle'
        })

      }

    }

  } catch (error) {

    console.log("Error : ", error);

  }

}

ptController.antrenmanEkle = async function (req, res) {

  try {

    id = req.session.pt;
    ptId = id["userId"];
    userId = req.body.userId;
    tarih = req.body.tarih;
    hareketId = req.body.hareketId;
    setSayisi = req.body.setSayisi;
    tekrarSayisi = req.body.tekrarSayisi;

    hareket = await helper.getDataById(hareketId, "hareketler");


    console.log("Hareket Video: ", hareket.videoLink);

    let filtre = {

      tarih: req.body.tarih,
      userId: userId,
      ptId: ptId,

    }

    let antrenmanlarProgramlari = await helper.getDataByObject(filtre, "antrenmanlarProgramlari")
    if (antrenmanlarProgramlari.length != 0) {

      if (!Array.isArray(antrenmanlarProgramlari[0]["hareketler"])) {
        antrenmanlarProgramlari[0]["hareketler"] = [];
      }

      let veri = {
        hareketId,
        setSayisi,
        tekrarSayisi,
        name: hareket.name,
        videoLink: hareket.videoLink
      };

      antrenmanlarProgramlari[0]["hareketler"].push(veri);

      let rs = await helper.updateOneField(antrenmanlarProgramlari[0].id, antrenmanlarProgramlari[0], "antrenmanlarProgramlari");

      console.log("Rs : ", rs.data.hareketler[0]);

      if (rs.onay == 1) {

        req.flash("flashSuccess", "Antrenman Eklendi.")
        res.redirect('/pt/antrenmanEkle')

      } else {

        req.flash("errorFlash", "Antrenman Eklenemedi.")
        res.redirect('/pt/antrenmanEkle')

      }

    } else {

      antrenman = {

        ptId: ptId,
        userId: userId,
        tarih: tarih,
        hareketler: [{
          hareketId,
          setSayisi,
          tekrarSayisi,
          name: hareket.name,
          videoLink: hareket.videoLink
        }]

      }

      let rs = await helper.insertObject(antrenman, "antrenmanlarProgramlari");

      if (rs.error == 0) {

        req.flash("flashSuccess", rs.message)
        res.redirect('/pt/antrenmanEkle')

      } else {

        req.flash("errorFlash", rs.message)
        res.redirect('/pt/antrenmanEkle')

      }

    }

  } catch (error) {

    console.log("Error : ", error);

  }

}

ptController.update = async function (req, res, next) {


  try {

    const fullname = req.body.fullname;
    const [name, surname] = fullname.split(' ');
    var userId;
    if (req.session.pt.userId) {

      userId = req.session.pt.userId

    }

    updateFields = {

      name: name,
      surname: surname,
      gsm: req.body.gsm,
      gender: req.body.gender,
      birthday: req.body.birthday,
      email: req.body.email,

    }

    let rs = await helper.updateOneField(userId, updateFields, "pt")

    if (rs.onay == 1) {

      req.flash("flashSuccess", "Profiliniz Guncellendi")
      req.session.pt = rs.data
      req.session.pt.userId = userId
      res.redirect('/pt/profile')

    } else {

      req.flash("flashError", "Profiliniz Guncellenemedi.")
      res.redirect('/pt/profile')

    }


  } catch (error) {

    console.log(error);

  }

}

ptController.beslenmeGetir = async function (req, res, next) {

  try {

    id = req.params.id;
    console.log("Id", id);

    let filtre = {

      userId: id,

    }
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    let ogunler = await helper.getDataByObject(filtre, "danisanOgunleri");
    let yemekler = await helper.getByCollection("meal");

    ogunler.forEach(element => {

      const [year, month, day] = element.tarih.split('-');
      const date = new Date(year, month - 1, day);
      element.gun = days[date.getDay()];

      if (element.Sabah) {

        for (let index = 0; index < element.Sabah.length; index++) {

          yemekler.forEach(yemek => {

            if (yemek.id == element.Sabah[index]) {

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

    ogunler.sort((a, b) => {
      const tarihA = new Date(a.tarih);
      const tarihB = new Date(b.tarih);
      return tarihA - tarihB;
    });

    res.render('pt/beslenmeGoster', {
      title: 'Beslenme',
      ogunler: ogunler
    });


  } catch (error) {

    console.log("Error : ", error);

  }




}

ptController.raporGetir = async function (req, res, next) {

  try {






  } catch (error) {

    console.log("Error : ", error);

  }


}

ptController.deleteOgunItem = async function (req, res, next) {

  try {

    let rs = await helper.deleteById(req.params.id, "danisanOgunleri");

    if (rs.error == 0) {
      req.flash("flashSuccess", rs.message)
      res.redirect('/pt/danisanlarim')
    } else {
      req.flash("flashError", rs.message)
      res.redirect('/admin/danisanlarim')

    }

  } catch (error) {

    console.log("Error : ", error.message);

  }


}

ptController.deleteAntrenmanItem = async function (req, res, next) {

  try {

    let rs = await helper.deleteById(req.params.id, "antrenmanlarProgramlari");

    if (rs.error == 0) {
      req.flash("flashSuccess", rs.message)
      res.redirect('/pt/danisanlarim')
    } else {
      req.flash("flashError", rs.message)
      res.redirect('/admin/danisanlarim')

    }

  } catch (error) {

    console.log("Error : ", error.message);

  }


}

ptController.mesajlariGetir = async function (req, res, next) {

  try {

    console.log("Req Params :", req.params.id);
    console.log("Req Session Pt  :", req.session.pt.userId);

    gonderdigimMesajlarFiltre = {

      gonderici: req.session.pt.userId,
      alıcı: req.params.id

    }

    gelenMesajlarFiltre = {

      gonderici: req.params.id,
      alıcı: req.session.pt.userId

    }


    let gonderilenMesajlar = await helper.getDataByObject(gonderdigimMesajlarFiltre, "messages")

    gonderilenMesajlar = gonderilenMesajlar.filter(element => element.alıcı === req.params.id);
    gonderilenMesajlar.forEach(element => {
      element.sag = 1;
    });

    let gelenMesajlar = await helper.getDataByObject(gelenMesajlarFiltre, "messages")
    gelenMesajlar = gelenMesajlar.filter(element => element.gonderici === req.params.id);

    gelenMesajlar.forEach(element => {
      element.sag = 0;
    });

    let birlesmisMesajlar = gonderilenMesajlar.concat(gelenMesajlar);

    // Tarihe göre sıralama
    birlesmisMesajlar.sort((a, b) => {
      const dateA = new Date(a.tarih);
      const dateB = new Date(b.tarih);
      return dateA - dateB;
    });

    console.log("Birleşmiş Mesajlar : ", birlesmisMesajlar);

    res.render('pt/message', {
      title: 'Mesajlaşma',
      benimYolladiklarim: birlesmisMesajlar
    });



  } catch (error) {

    console.log("Error : ", error);

  }

}

ptController.mesajGonder = async function (req, res) {

  try {

    mesaj = {

      alıcı: req.body.alıcıId,
      gonderici: req.session.pt.userId,
      message: req.body.message,
      tarih: req.body.tarih

    }

    console.log("Mesaj : ", mesaj);

    let rs = await helper.insertObject(mesaj, "messages")

    if (rs.error == 0) {

      res.send({
        redirectURL: `/pt/mesajlariGetir/${req.body.alıcıId}`
      })

    } else {

      res.send({
        redirectURL: `/pt/mesajlariGetir/${req.body.alıcıId}`
      })

    }


  } catch (error) {

    console.log("Error : ", error);

  }

}

ptController.raporGetir = async function (req, res, next) {

  try {

    let raporlar = await helper.getDataByField("userId", req.query.id, "raporlar");
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

ptController.raporSayfasiGetir = async function (req, res, next) {

  try {

    let raporlar = await helper.getByCollection("raporlar")
    raporlar = raporlar.filter(element => element.userId === req.params.id);

    res.render('pt/raporGetir', {title : "Rapor Getir" , raporlar : raporlar})

  } catch (error) {

    console.log("Error : ", error);

  }


}


module.exports = ptController