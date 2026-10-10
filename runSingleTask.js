import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";


import { SupabaseUploadObject } from "./supadb.js";




const client = new Client({
  name: "delegated-runtime",
  version: "1.0.0",
});


import { v4 as uuidv4 } from "uuid";





export default async function runSingleTask(task) {
  const taskId = uuidv4();

  try {

     await client.connect(
        new StreamableHTTPClientTransport(
        new URL(task.url),
        {
        requestInit: {
            headers: {
            Authorization: `Bearer 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` 
        },
        },
    }));

    let toolcallResult=await client.callTool({
      name:task.name,
      arguments:task.params
    })

    
    let status=await SupabaseUploadObject({
      table:"tasks",
      asset:{
        id: taskId,
        tool:task.name,
        inputs:task.params,
        status: "completed",
        output: toolcallResult,
        completed_at: new Date()
      }
    });

    if(status==true){

       return { task_id: taskId,status:"success"};
      
    }
   
    
  } catch (error) {
    
    console.error(`Error processing task ${task.name}:`, error);

    let status=await SupabaseUploadObject({
      table:"tasks",
      asset:{
        id: taskId,
        primitive: task.name,
        status: "failed",
        error: error.message,
        failed_at: new Date()
      }
    });
    console.log(error)
    return { task_id: taskId,status:String(error)};
  }




  
}

