import { Client, Users, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.MESSAGE_API_KEY);

  const db = new Databases(client);

  try {
    const databaseId = process.env.XANA_DATABASE_ID;
    const collectionId = process.env.XANA_MESSAGE_ID;
    /*for local development
    const userId = process.env.USER_ID;
    */
   const userId = req.headers["x-appwrite-user-id"]

    

    if (req.method == 'GET') {
      const docMap = new Map();
      let lastDocumentId = '';
      await getMessageList(databaseId, collectionId, userId, lastDocumentId, docMap, db, log);

      return res.json(Object.fromEntries(docMap)); // Convert Map to object before returning
    }

    return res.text("data not found");

  } catch (err) {
    error("Could not list users: " + err.message);
  }

  return res.json({ "msg": "data failed" });
};

async function getMessageList(dbId, ctId, userId, lastDocumentId, docMap, db, log) {
  log("Fetching messages...");
  
  const query = lastDocumentId
    ? [
        Query.or([
          Query.equal("receiverId", userId),
          Query.equal("senderId", userId)
        ]),
        Query.cursorAfter(lastDocumentId)
      ]
    : [
        Query.or([
          Query.equal("receiverId", userId),
          Query.equal("senderId", userId)
        ])
      ];

  try {
    const response = await db.listDocuments(dbId, ctId, query);
    
    if (response.documents && response.documents.length > 0) {
      response.documents.forEach((item) => {
        const doc = JSON.parse(JSON.stringify(item));
        
        if (doc.senderId !== null && doc.receiverId !== null) {
          if (doc.senderId === userId && !docMap.has(doc.receiverId)) {
            docMap.set(doc.receiverId, doc);
          } else if (doc.receiverId === userId && !docMap.has(doc.senderId)) {
            docMap.set(doc.senderId, doc);
          }
        }
      });

      // Proceed with next page if there's a last document
      lastDocumentId = response.documents[response.documents.length - 1].$id;
      return await getMessageList(dbId, ctId, userId, lastDocumentId, docMap, db, log);
    }

  } catch (err) {
    log("Failed to retrieve messages: " + err.message);
    throw err; // Rethrow to catch in main function if needed
  }
}
