const db = require('../utility/firestore');

const exercisesCollection = db.collection('exercises');

async function addUser(name, surname ,email, password,gender, birthday, gsm, pic) {
 
  try {

    const querySnapshot = await usersCollection.where('email', '==', email).get();

    if(querySnapshot.empty){

      await usersCollection.add({ name, surname ,email, password,gender, birthday, gsm, pic});

      let rs = {
        message : "Veri Basarili bir sekilde eklendi.",
        onay : 1
      }

      return rs

    }else {

      let rs = {

        message : "Mail adresi zaten kayitli",
        onay : 0
        
      }

      return rs

    }

  } catch (error) {
    
  }

};

function getAllExercise() {

  return usersCollection.get();

}

async function getUserByField(field, value) {
  try {

    const user = await usersCollection.where(field, '==', value).get();
    return user;

  } catch (error) {
    console.error('Hatalı sorgu', error.message);
    throw error;
  }
}

module.exports = { addUser, getAllUsers, getUserByField};
