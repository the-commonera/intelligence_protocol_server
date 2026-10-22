import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

const client = new Client({
  name: "tripwire-test-client",
  version: "1.0.0",
});




export default async function CommonClient(payload){


  try {


    const transport = new StreamableHTTPClientTransport(
    new URL(payload.mcp),
                {
    requestInit: {
      headers: {
          "Authorization": `Bearer ${payload.apikey}`,
         "Content-Type": "application/json"
        // You can add additional custom headers here if needed (e.g., "X-API-Key")
      }
    }
  }
  );

  await client.connect(transport);

  return client

    
  } 
  catch(e){

  console.log(e)
  return false
    
  }


}
