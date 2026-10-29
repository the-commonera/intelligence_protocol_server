import { SupabaseFetchObjectFromTemplates } from "../database/supadb.js";
import { extractIntent } from "../engine/intentextractor.js";
import { processCapabilityStep } from "../engine/capabilityexecutor.js";


export default async function GenerationEngine(payload) {


    console.log("inside engine");
    // 1. Fetch document template configuration
    const document = await SupabaseFetchObjectFromTemplates({
        id: payload.id,
        tenantid: payload.tenantid
    });
    console.log("fetched document", document);

    // 2. Extract structured intent
    const intentoutput = await extractIntent(payload.goal, document);

    let priorResults = [];
    //let codelist = [];
  
    // 3. Iterate through capabilities securely and deterministically
    for (let capabilityObject of document.capabilities) {


        const stepResult = await processCapabilityStep(
            capabilityObject, 
            document, 
            payload, 
            intentoutput, 
            priorResults
        );

        priorResults.push({
            name: stepResult.name,
            result: stepResult.result
        });

    }


    console.log(priorResults)
    console.log("Engine execution completed successfully.");


}
