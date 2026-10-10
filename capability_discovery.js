import CommonClient from "./commonmcp_client.js";





export default async function CapabilityDiscovery(payload) {


    let client=await CommonClient({
      mcp:payload.mcp,
      apikey:payload.apikey
    })
  

    try {

    const response = await client.listTools();
    const tools = response.tools;



    console.log(`Found ${tools.length} total tool(s) on the server. Filtering...\n`);

  
    const results = [];
      
    for (const tool of tools) {


      console.log("inside loop")
      
      if (payload.targetTools.includes(tool.name)) {


        console.log("tool match",tool.name)
    
        const properties = tool.inputSchema?.properties || {};

        results.push({
          name: tool.name,
          description:tool.description,
          properties: properties,
        });
      }

      
    }

    //  

    let  toolDefinitions = results.map((tool) => {
    return `
      - Tool Name: ${tool.name}
       - Description: ${tool.description}
      - Parameters (JSON Schema Properties): ${JSON.stringify(tool.properties)}`;
  }).join("\n\n");

      
    console.log(" returning tool definitions")
      
    return toolDefinitions
      

  } catch (error) {
    console.error("Error interacting with the MCP server:", error);
  } finally {
    
    await client.close();
  }




  
}
