import CodeGenPrompt from "./code_generation_prompt_new.js";
import CapabilityDiscovery from "./capability_discovery.js";
import  { callLLM } from "./commonllmengine.js";
import {SupabaseFetchObjectFromTemplates} from "./supadb.js";
import Execute from "./execution.js";
import ConstructFinalOutputSchema from "./finaloutputschema_constructor.js";
import intentDataPrompt from "./intent_data_extraction_prompt.js";






function cleanGeneratedCode(rawOutput) {
  if (!rawOutput) return null;
  
  return rawOutput
    .replace(/^```[a-z]*\s*/i, '') // Removes opening ```javascript or ```
    .replace(/\s*```$/, '')        // Removes closing ```
    .trim();
}





 
export default async function CodeGenerationEngine(payload) {

  
      console.log("inside engine")
  

       let document=await SupabaseFetchObjectFromTemplates({
             id:payload.id,
             tenantid:payload.tenantid
      })

      //let final_capabilities_discovered=``

      let userintentdataprompt=await intentDataPrompt(payload.goal)

      let intentoutput=await LLMEngine({
        
            systemprompt:userintentdataprompt,
            userprompt:`
            USER INTENT:
            ${payload.goal}
              `
        })

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

               context+=JSON.stringify(document.context)+"\n\n"
               context+=JSON.stringify(payload.context)+"\n\n"
        
               let prompt=CodeGenPrompt(

                     JSON.stringify(data), // data
                     payload.goal, // userTask
                     intentoutput,  // taskFacts
                     capabilityObject.name ,// CURRENT CAPABILITY,
                     capabilities_data,
                     remaining, // REMAINING CAPABILITIES
                     context,
                     priorResults // PRIOR RESULTS
                     )
               pmpt.push(prompt)

               console.log("inside running code")
        
               /*
               let Code=await LLMEngine({systemprompt:prompt,userprompt:payload.goal})
        
               let codepayload={ provider:document.modeldata.provider,"",prompt,userprompt,document.modeldata.model}

        
               let Code =await CallLLM(codepayload)


               let cleancode =cleanGeneratedCode(Code)
               codelist.push(cleancode)
              */
               priorResults.push({
                 
                    name:capabilityObject.name
                });

        
              
        
      }

      return {"test":pmpt}
  
}