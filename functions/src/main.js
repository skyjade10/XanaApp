import { Client, Users,Databases, Query } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);
  const db = new Databases(client);
  try {

    const databaseId = process.env.XANA_DATABASE_ID
    const collectionId = process.env.XANA_MESSAGE_ID

    
    if(req.method == 'GET'){

      const query = [
        Query.equal("receiverId",req.userId),
        Query.equal("senderId",req.userId)
      ]

      const response = await db.listDocuments(
        databaseId,
        collectionId,
        query
      )

      response.documents.map((item,index) => {
        log(item)
      })
    }

  } catch(err) {
    error("Could not list users: " + err.message);
  }

};
