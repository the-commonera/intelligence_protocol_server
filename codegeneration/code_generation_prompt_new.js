const RULES = `
# RULES
1. **Output Format**: Return ONLY a JSON object of params for the **CURRENT CAPABILITY**, matching SCHEMA. No code, no markdown, no commentary. If a required param cannot be resolved, return {"unresolved": "<param name>"}.
2. **Source Priority** (Check in order, stop at first match):
   - **CONTEXT**: Match param names or semantic equivalents directly.
   - **PRIOR STEP'S PARAMS**: If a prior call used a literal for the same real-world resource (e.g., step 1's \`name: "testrepo"\` maps to step 2's \`repo\`), reuse that exact literal verbatim.
   - **PRIOR STEP'S RESULT**: Use IDs, tokens, or hashes produced explicitly in a prior step's result JSON.
   - **Namespaces/Owners**: \`owner\`, \`org\`, \`tenant\` always come from **CONTEXT**, never prior results.
3. **Forbidden**: No placeholder strings ("TODO", "<owner>"), no invented values, no params outside SCHEMA.
`;


const EXAMPLE = `
// Example: step 2, reusing a literal from step 1's params
{ "owner": "the-junaid-bashir", "repo": "testrepo", "path": "file1.txt", "content": "hello world" }
`;



export default function CodeGenPrompt(userTask, taskFacts, currentCapability, capabilitydata, remainingCapabilities, context, priorResults) {


  
  const formattedPrior = priorResults && priorResults.length
    ? JSON.stringify(priorResults, null, 2)
    : "(none yet — first step)";

  return `
You are a parameter resolver. Produce the params for ONE step of the user's task as a JSON object. Do not answer in natural language.
# USER'S OVERALL TASK:
${userTask}
# EXTRACTED FACTS:
${taskFacts}
# CONTEXT:
${context}
# CURRENT CAPABILITY:
${currentCapability}
# SCHEMA:
${capabilitydata}
# REMAINING CAPABILITIES (for awareness only, never resolve their params):
${remainingCapabilities || "(none)"}
# PRIOR RESULTS:
${formattedPrior}
${RULES}
# OUTPUT EXAMPLE:
${EXAMPLE}
Return ONLY the JSON object.
`;
}


