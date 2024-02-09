const db = require('../utility/firestore');

const danisanPtCollection = db.collection('danisanPt');

async function addDanisanPt(danisanId, ptId) {
 
  try {

    const querySnapshot = await danisanPtCollection.where('danisanId', '==', danisanId).get();

    if(querySnapshot.empty){

      await danisanPtCollection.add({ danisanId, ptId});

      let rs = {

        message : "Danisan Pt'ye Eklendi.",
        onay : 1

      }

      return rs

    } else {

      let rs = {

        message : "Danisan Zaten Bir Pt'ye Kayitli.",
        onay : 0
        
      }

      return rs

    }

  } catch (error) {

    console.log("Error : " , error.message);

  }

};

async function getAllDanisanPt() {

  const snapshot = await danisanPtCollection.get();
    const pts = [];
    snapshot.forEach((doc) => {
        pts.push({ id: doc.id, ...doc.data() });
    });
    return pts;

}

async function getdanisanPtByField(field, value) {
  try {

    const pt = await danisanPtCollection.where(field, '==', value).get();
    return pt;

  } catch (error) {
    console.error('Hatalı sorgu', error.message);
    throw error;
  }
}

async function deleteDanisanPt(docId) {

  try {

    const docRef = danisanPtCollection.doc(docId);
    await docRef.delete();

    return 1;

  } catch (error) {
    console.error('Hatalı sorgu', error.message);
    throw error;
  }

}

module.exports = { addDanisanPt, getAllDanisanPt, getdanisanPtByField, deleteDanisanPt};
