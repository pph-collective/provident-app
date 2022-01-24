const SEED = require("./seed.json");

const seedDatabase = async (admin) => {
  if (admin.firestore()._settings.servicePath === "localhost") {
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
      const subCollections = documentData["subCollections"];
      if (subCollections) {
        writeBatch(
          batch,
          collection.doc(documentPath),
          documentData["subCollections"]
        );
      }

      delete documentData["subCollections"];
      if (documentData) {
        batch.set(collection.doc(documentPath), documentData);
      }
    }
  }
};

module.exports = {
  seedDatabase,
};
