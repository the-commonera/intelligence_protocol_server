import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";


const client = new Client({
  name: "delegated-runtime",
  version: "1.0.0",
});


export default async function runSingleTask(task) {

  try {

     await client.connect(
        new StreamableHTTPClientTransport(
        new URL(task.url),
        {
        requestInit: {
            headers: {
            Authorization: `Bearer ${task.apikey

            }` 
        },
        },
    }));

    let toolcallResult=await client.callTool({
      name:task.name,
      arguments:task.params
    })

    return {
      params:task.params,
      output:toolcallResult
    }
    
  } catch (error) {
    
   return null
  }
  
}

