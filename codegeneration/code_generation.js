import CodeGenPrompt from "./code_generation_prompt_new.js";
import CapabilityDiscovery from "../discovery/capability_discovery.js";
import  { callLLM } from "../commonclients/commonllmengine.js";
import {SupabaseFetchObjectFromTemplates,SupabaseUploadObject} from "../database/supadb.js";
import Execute from "../core/execution.js";
import intentDataPrompt from "./intent_data_extraction_prompt.js";


function cleanGeneratedCode(rawOutput) {

  if (!rawOutput) return null;
  return rawOutput

  .replace(/^```[a-z]*\s*/i, '')
  .replace(/\s*```$/, '')
  .trim();

}


 
export default async function CodeGenerationEngine(payload) {

  
      console.log("inside engine")
  

       let document=await SupabaseFetchObjectFromTemplates({
             id:payload.id,
             tenantid:payload.tenantid
      })
      console.log("fetched document",document)

      //let final_capabilities_discovered=``

      
      let systemprompt=intentDataPrompt(payload.goal)
      let provider=document.modeldata.provider
      let model=document.modeldata.model
      let apikey=document.modeldata.apikey
      let userprompt=`
      USER INTENT:
            ${payload.goal}
              `

      console.log(apikey)
            
      
      let intentoutput=await callLLM(
        
            provider,
            apikey,
            systemprompt,
            userprompt,
            model
        )

      //}
      
      console.log(intentoutput)
  
      let priorResults = [];
      let pmpt=[]
      let codelist=[]

      for (let capabilityObject of document.capabilities) {

               let capabilities_data = `${
                 await CapabilityDiscovery({ 
                      mcp:capabilityObject.mcp_url,
                      apikey:capabilityObject.apikey,
                      targetTools:[capabilityObject.name]
                  })}\n\n`

               
               const remaining = document.capabilities
                   .map(c => c.name)
                   .filter(name =>
                   name !== capabilityObject.name &&
                  !priorResults.some(r => r.name === name)
                );
              
               let data={"MCP_URL":capabilityObject.mcp_url,"API_KEY":capabilityObject.apikey}
               let context=``

               //context+=JSON.stringify(document.context)+"\n\n"
               context+=JSON.stringify(payload.context)+"\n\n"
        
               let systemprompt2=CodeGenPrompt(

                     JSON.stringify(data), // data
                     payload.goal, // userTask
                     intentoutput,  // taskFacts
                     capabilityObject.name ,// CURRENT CAPABILITY,
                     capabilities_data,
                     remaining, // REMAINING CAPABILITIES
                     context,
                     priorResults // PRIOR RESULTS
                     )
          


                let provider2=document.modeldata.provider
                let model2=document.modeldata.model
                let apikey2=document.modeldata.apikey
                

                let Code =await callLLM(provider2,apikey2,systemprompt2,payload.goal,model2)
                let cleancode = cleanGeneratedCode(Code)
                codelist.push(cleancode)
               

                let executionResult=await Execute(cleancode)
               
                if (executionResult !==null){
                  await SupabaseUploadObject({
                    table:"tasks",
                    asset:  {

                      id:`${payload.tenantid}_${payload.id}`,
                      tool:capabilityObject.name,
                      inputs:executionResult.params,
                      status:"completed",
                      output:executionResult.output,
                      completed_at:new Date()

                    }

                  })
                  
                }
                else if(executionResult==null){
                    await SupabaseUploadObject({
                    table:"tasks",
                    asset:  {

                      id:`${payload.tenantid}_${payload.id}`,
                      tool:capabilityObject.name,
                      inputs:executionResult.params,
                      status:"failed",
                      output:null,
                      completed_at:new Date()

                    }

                  })

                }
                priorResults.push({
                 
                    name:capabilityObject.name,
                    result:executionResult

                });

           
        
            }

      
 
}
