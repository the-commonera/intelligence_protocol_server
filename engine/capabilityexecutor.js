import CapabilityDiscovery from "../discovery/capability_discovery.js";
import CodeGenPrompt from "../codegeneration/code_generation_prompt_new.js";
import { callLLM } from "../commonclients/commonllmengine.js";
import Execute from "../core/execution.js";
//import cleanGeneratedCode from "../helpers/cleancode.js";
import { logTaskExecution } from "./tasklogger.js";
import runSingleTask from "../core/runSingleTask.js";



import {decrypt} from "../credentials/encryption.js"



export async function processCapabilityStep(capabilityObject, document, payload, intentoutput, priorResults) {




     let decryptedModelKey=decrypt(document.model_cred)
     let decryptedMCPKeysObject=decrypt(document.mcp_cred)
     let stringObject=JSON.parse(decryptedMCPKeysObject)


     const targetUrl = capabilityObject.mcp_url ? capabilityObject.mcp_url.trim() : "";
     const matchedObj = stringObject.find(obj => obj.mcp_url === targetUrl);
     const mcpAPI = matchedObj ? matchedObj.apikey : null;
     
/////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    // 1. Discover capability tools
    const capabilities_data = `${await CapabilityDiscovery({ 
        mcp: capabilityObject.mcp_url,
        apikey:mcpAPI,
        targetTools: [capabilityObject.name]
    })}\n\n`;

    // 2. Compute remaining capabilities
    const remaining = document.capabilities
        .map(c => c.name)
        .filter(name => name !== capabilityObject.name && !priorResults.some(r => r.name === name));
    
    const data = { "MCP_URL": capabilityObject.mcp_url, "API_KEY": mcpAPI };
    const context = `${JSON.stringify(payload.context)}\n\n`;

    // 3. Construct system prompt for code generation
    const systemprompt2 = CodeGenPrompt(
       // JSON.stringify(data),
        payload.goal,
        intentoutput,
        capabilityObject.name,
        capabilities_data,
        remaining,
        context,
        priorResults
    );

    // 4. Call LLM to generate code
    const { provider, model} = document.modeldata;
    const params = await callLLM(provider, decryptedModelKey, systemprompt2, payload.goal, model);


    let executionResult=await runSingleTask({
        url:data.MCP_URL,
        apikey:data.API_KEY,
        params:params
    })

    //const cleancode = cleanGeneratedCode(rawCode);
    // 5. Execute generated code
    //const executionResult = await Execute(cleancode);
    //console.log(executionResult)
    // 6. Log results (Supabase & Graph)
    //await logTaskExecution(payload, capabilityObject, cleancode, executionResult);
    

    return {
        name: capabilityObject.name,
        result:executionResult.output
    };



}
