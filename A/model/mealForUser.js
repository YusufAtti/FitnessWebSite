const db = require('../utility/firestore');

const mealForUserCollection = db.collection('mealForUser');

async function addMealForUser(mealId, userId, gram, mealTime, dateTime) {
 
  try {

      await mealCollection.add({mealId, userId, gram, mealTime, dateTime});

      let rs = {
        message : "Öğün Eklendi.",
        onay : 1
      }

      return rs


  } catch (error) {

    let rs = {
        message : "Öğün Eklenemedi : " + error.message,
        onay : 1
      }

      return rs
    
  }

};

// async function getAllMeal() {

//   const snapshot = await mealCollection.get();
//     const meals = [];
//     snapshot.forEach((doc) => {
//       meals.push({ id: doc.id, ...doc.data() });
//     });
//     return meals;

// }

// async function getMealByName(field, value) {

//   try {

//     const meal = await mealCollection.where(field, '==', value).get();
//     return meal;

//   } catch (error) {
//     console.error('Hatalı sorgu', error.message);
//     throw error;
//   }

// }
// async function deleteMeal(docId) {

//   try {

//     const docRef = mealCollection.doc(docId);
//     await docRef.delete();

//     return 1;

//   } catch (error) {
//     console.error('Hatalı sorgu', error.message);
//     throw error;
//   }

// }

module.exports = { addMealForUser};
