import { Client, Users,Databases, Query } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()


    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.MESSAGE_API_KEY);
    
  const db = new Databases(client);
  try {

    const databaseId = process.env.XANA_DATABASE_ID
    const collectionId = process.env.XANA_MESSAGE_ID

    
    if(req.method == 'GET'){

      const query = [
      ]

      const response = await db.listDocuments(
        databaseId,
        collectionId,
        query
      )

      response.documents.map((item,index) => {
        log(item)
      })

      return res.json(response.documents)
    }else{
      return res.text("data not found")
    }


  } catch(err) {
    error("Could not list users: " + err.message);
  }

  return res.text("failed")

};
