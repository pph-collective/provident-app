const SEED = require("./seed.json");

const seedDatabase = async (admin) => {
  if (admin.firestore()._settings.servicePath === "localhost") {
    const writeBatch = admin.firestore().batch();

    if (SEED) {
      for (const [collectionName, documents] of Object.entries(SEED)) {
        let collection = admin.firestore().collection(collectionName);
        for (const [documentPath, subCollections] of Object.entries(
          documents
        )) {
          for (const [subCollectionPath, subDocuments] of Object.entries(
            subCollections
          )) {
            if (subCollectionPath === "data") {
              writeBatch.set(collection.doc(documentPath), subDocuments);
            } else {
              for (const [subDocumentPath, data] of Object.entries(
                subDocuments
              )) {
                writeBatch.set(
                  collection
                    .doc(documentPath)
                    .collection(subCollectionPath)
                    .doc(subDocumentPath),
                  data
                );
              }
            }
          }
        }
      }
    }

    await writeBatch.commit();
    return true;
  }

  return false;
};

module.exports = {
  seedDatabase,
};
