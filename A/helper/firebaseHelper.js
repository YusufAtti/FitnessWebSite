const db = require('../utility/firestore');


module.exports = {


    getDataByField: async (field, value, collectionName) => {

        return new Promise(async (resolve, reject) => {


            try {

                const Collection = db.collection(collectionName);

                Collection.where(field, '==', value)
                    .get()
                    .then((querySnapshot) => {
                        const data = [];
                        querySnapshot.forEach((doc) => {
                            a = doc.data();
                            a.id = doc.id;
                            data.push(a);
                        });
                        console.log("Veri alındı:", data);
                        resolve(data)
                    })
                    .catch((error) => {
                        
                        console.log("Veri alma hatası: ", error);

                    });

            } catch (err) {

                console.log("Error : ", err);
                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }

        });

    },

    getDataByObject: async (filtre, collectionName) => {

        return new Promise(async (resolve, reject) => {


            try {

                const Collection = db.collection(collectionName);

                Collection.where(Object.keys(filtre)[0], '==', Object.values(filtre)[0])
                    .get()
                    .then((querySnapshot) => {
                        const data = [];
                        querySnapshot.forEach((doc) => {
                            a = doc.data();
                            a.id = doc.id;
                            data.push(a);
                        });
                        resolve(data)
                    })
                    .catch((error) => {
                        
                        console.log("Veri alma hatası: ", error);

                    });

            } catch (err) {

                console.log("Error : ", err);
                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }

        });

    },

    insertObject: async (object, collectionName) => {

        return new Promise(async (resolve, reject) => {

            try {

                const Collection = db.collection(collectionName);

                Collection.add(object).then(docRef => {

                    console.log('Belge eklendi, belge kimliği:', docRef.id);
                    resolve({

                        error: 0,
                        message: "Veri Başarılı bir şekilde eklendi.",
                        data: docRef.id

                    })

                }).catch(err => {

                    reject({
                        error: 1,
                        message: err.message
                    })

                })

            } catch (err) {

                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }

        });
    },

    updateOneField: async (id, newValues, collectionName) => {

        return new Promise(async (resolve, reject) => {

            try {

                const Collection = db.collection(collectionName);

                const referans = Collection.doc(id);
                const doc = await referans.get();

                if (doc.exists) {

                    const docData = doc.data();

                    // Güncellenmiş alanları kullanıcı verisine ekle
                    const updatedData = {
                        ...docData,
                        ...newValues
                    };

                    await referans.update(updatedData);

                    resolve({
                        onay: 1,
                        data: updatedData
                    })

                } else {

                    resolve({
                        onay: 0,
                        data: "Guncellenecek Veri Bulunamadi."
                    })
                }

            } catch (err) {

                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }


        });

    },

    getDataById: async (id, collectionName) => {
        return new Promise(async (resolve, reject) => {
            try {
                const Collection = db.collection(collectionName);
    
                Collection.doc(id).get()
                    .then((doc) => {
                        if (doc.exists) {
                            a = doc.data()
                            a.id = doc.id
                            console.log("Belge bulundu:", a);
                            resolve(a);
                        } else {
                            console.log("Belge bulunamadı.");
                            resolve(null);
                        }
                    })
                    .catch((error) => {
                        console.log("Belge alma hatası:", error);
                        reject(error);
                    });
            } catch (err) {
                console.log("Hata:", err);
                resolve({
                    'error': 1,
                    'messages': err.message
                });
            }
        });
    },
    

    getByCollection: async (collectionName) => {

        return new Promise(async (resolve, reject) => {

            try {

                const Collection = db.collection(collectionName);

                Collection.get().then(querySnapshot => {

                    const dataArray = [];
                    querySnapshot.forEach((doc) => {
                        a = doc.data()
                        a.id = doc.id
                        dataArray.push(a);
                    });

                    resolve(dataArray);

                }).catch(err => {

                    console.log('Veri alma hatası:', err.message);
                    reject(error);

                })

            } catch (err) {

                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }

        });

    },

    deleteById: async (id, collectionName) => {

        return new Promise(async (resolve, reject) => {

            try {

                const Collection = db.collection(collectionName);

                Collection.doc(id).delete().then(() => {

                    resolve({

                        error: 0,
                        message: "Belge Silindi."

                    })

                }).catch(err => {

                    console.error('Veri alma hatası:', err.message);
                    reject(error);

                })

            } catch (err) {

                resolve({
                    'error': 1,
                    'messages': err.message
                });

            }

        });

    }


}