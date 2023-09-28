const SEED = require("./seed.json");

const seedDatabase = async (admin) => {
  if (
    ["localhost", "127.0.0.1"].includes(admin.firestore()._settings.servicePath)
  ) {
    const batch = admin.firestore().batch();

    if (SEED) {
      writeBatch(batch, admin.firestore(), SEED);
    }

    await batch.commit();
    return true;
  }

  return false;
};

const writeBatch = (batch, firestoreRef, data) => {
  for (const [collectionName, documents] of Object.entries(data)) {
    let collection = firestoreRef.collection(collectionName);

    for (const [documentPath, documentData] of Object.entries(documents)) {
      const { subCollections, ...data } = documentData;
      if (subCollections) {
        writeBatch(batch, collection.doc(documentPath), subCollections);
      }

      if (documentData) {
        batch.set(collection.doc(documentPath), data);
      }
    }
  }
};

module.exports = {
  seedDatabase,
};
