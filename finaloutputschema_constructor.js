import { FetchOutputSchemaFromPastRuns } from "./supadb.js";




function flattenKeys(obj, prefix = '') {
  let keys = [];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      keys.push(path);
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys = keys.concat(flattenKeys(value, path));
      }
    }
  }
  return keys;
}




export default async function ConstructFinalOutputSchema(capabilities) {

  let final_output_schemas = ``;

  for (let capability of capabilities) {

    let rawOutput;
    try {
      rawOutput = await FetchOutputSchemaFromPastRuns({ tool: capability });
    } catch (e) {
      console.log(`schema lookup failed for ${capability}:`, e);
      continue;
    }

    if (rawOutput == null) {
     
      continue;
    }

    const innerJsonString = rawOutput?.output?.content?.[0]?.text;
    if (typeof innerJsonString !== "string" || innerJsonString.length === 0) {
      continue;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(innerJsonString);
    } catch (e) {
    
      console.log(`stored output for ${capability} is not valid JSON, skipping:`, innerJsonString);
      continue;
    }

    
    if (parsedData && typeof parsedData === "object" && ("error" in parsedData || parsedData.isError)) {
      console.log(`stored output for ${capability} looks like an error payload, skipping:`, parsedData);
      continue;
    }

    const keys = flattenKeys(parsedData);
    if (!keys || keys.length === 0) {
      continue;
    }

    final_output_schemas += `### Capability: ${capability}\n`;
    final_output_schemas += `OUTPUT KEYS: ${keys.join(", ")}\n\n`;
  }

  return final_output_schemas;
}