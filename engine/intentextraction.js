import intentDataPrompt from "../codegeneration/intent_data_extraction_prompt.js";
import { callLLM } from "../commonclients/commonllmengine.js";
import {decrypt} from "../credentials/encryption.js"


export async function extractIntent(goal, document) {

    const systemprompt = intentDataPrompt(goal);
    const { provider, model} = document.modeldata;
    const userprompt = `USER INTENT:\n ${goal}`;

    let decryptedModelKey=decrypt(document.model_cred)
    
    const intentoutput = await callLLM(provider, decryptedModelKey, systemprompt, userprompt, model);
    console.log("Intent output:", intentoutput);
    
    return intentoutput;
    
}
