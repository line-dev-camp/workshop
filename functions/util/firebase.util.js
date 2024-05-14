const { initializeApp,cert} = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
initializeApp();
const { Storage } = require('@google-cloud/storage');
const db = getFirestore();
const imagesDb = db.collection("images")


const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();


const moment = require('moment-timezone');

/* Insert publicUrl by groupId */
exports.insertImageGroup = async (groupId, messageId, publicUrl) => {

  const date = moment().tz('Asia/Bangkok').format('YYYY-MM-DD')

  await imagesDb.add({
    groupId: groupId,
    messageId: messageId,
    publicUrl: publicUrl,
    date: date
  })
}

/* Save image to cloud storage */
exports.saveImageToStorage = async (groupId,fileName,  binary) => {
  const date = moment().tz('Asia/Bangkok').format('YYYY-MM-DD')
  const storageBucket = storage.bucket(bucketName);
  const file = storageBucket.file(`${groupId}/${date}/${fileName}`);
  await file.save(binary);
  file.makePublic()
  return file.publicUrl()
};