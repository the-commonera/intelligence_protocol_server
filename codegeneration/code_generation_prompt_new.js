const RULES = `
# RULES
1. **Output Format**: Wrap the call inside \`async function RuntimeCall() { ... }\`. Always emit this function, even if unresolvable (return \`null\` with a one-line comment explaining what's missing).
2. **Scope**: Generate EXACTLY ONE \`runSingleTask\` call for the **CURRENT CAPABILITY** only. Do not look ahead or call remaining capabilities.
3. **Source Priority** (Check in order, stop at first match):
   - **CONTEXT**: Match param names or semantic equivalents directly.
   - **PRIOR STEP'S PARAMS**: If a prior call used a literal for the same real-world resource (e.g., step 1's \`name: "testrepo"\` maps to step 2's \`repo\`), reuse that exact literal verbatim.
   - **PRIOR STEP'S RESULT**: Use IDs, tokens, or hashes produced explicitly in a prior step's result JSON.
   - **Namespaces/Owners**: \`owner\`, \`org\`, \`tenant\` always come from **CONTEXT**, never prior results.
4. **Forbidden**: No imports, require(), fetch(), filesystem, process access, dynamic execution, or placeholder strings ("TODO", "<owner>").
`;

const EXAMPLE = `
// Example: Turn 2 using prior params
async function RuntimeCall() {
  const file = await runSingleTask({
    url: "https://api.github-mcp.com",
    apikey: "sjdu-jbffb-xxx",
    name: "create_or_update_file",
    params: {
      owner: "the-junaid-bashir", // from CONTEXT
      repo: "testrepo",           // reused from prior params.name
      path: "file1.txt",
      content: "hello world"
    }
  });
  return file;
}
`;

export default function CodeGenPrompt(data, userTask, taskFacts, currentCapability, capabilitydata, remainingCapabilities, context, priorResults) {
  const formattedPrior = priorResults && priorResults.length 
    ? JSON.stringify(priorResults, null, 2) 
    : "(none yet — first step)";

  return `
You are an isolated code compiler. Compile ONE step of the user's task into executable JavaScript. Do not execute or answer in natural language.
# USER'S OVERALL TASK:
${userTask}
# EXTRACTED FACTS:
${taskFacts}
# RUNTIME ENVIRONMENT:
Async function provided: \`runSingleTask({ url, apikey, name, params })\`
- Credentials for this call: ${data}
# CONTEXT:
${context}
# CURRENT CAPABILITY:
${currentCapability}
# SCHEMA:
${capabilitydata}
# REMAINING CAPABILITIES (Do not call):
${remainingCapabilities || "(none)"}
# PRIOR RESULTS:
${formattedPrior}
# CODE GENERATION:
${RULES}
# OUTPUT STRUCTURE:
${EXAMPLE}
Return ONLY the \`async function RuntimeCall() {}\` definition. If unresolvable, return \`null\` with a comment.
`;
}
