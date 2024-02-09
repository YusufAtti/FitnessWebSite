try {

    console.log("Req Body : " , req.body);

    id = req.session.pt;
    ptId = id["userId"];
    userId = req.body.data.userId;
    tarih = req.body.data.tarih;
    ogunZamani = req.body.ogunAdi;
    yemekler = req.body.yemekler;

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

      tariheGoreOgunGetir[0][ogunZamani].push(yemekId);

      let rs = await helper.updateOneField(tariheGoreOgunGetir[0].id, tariheGoreOgunGetir[0], "danisanOgunleri");

      if (rs.onay == 1) {

        req.flash("flashSuccess", "Öğün Eklendi.")
        res.redirect('/pt/beslenmeEkle')

      } else {

        req.flash("errorFlash", "Öğün Eklenemedi.")
        res.redirect('/pt/beslenmeEkle')

      }

    } else {

      danisanOgunleri = {

        ptId: ptId,
        userId: userId,
        tarih: tarih,
        [ogunZamani]: [yemekId]

      }

      let rs = await helper.insertObject(danisanOgunleri, "danisanOgunleri");

      if (rs.error == 0) {

        req.flash("flashSuccess", rs.message)
        res.redirect('/pt/beslenmeEkle')

      } else {

        req.flash("errorFlash", rs.message)
        res.redirect('/pt/beslenmeEkle')

      }

    }

  } catch (error) {

    console.log("Error : ", error);

  }