import OpenAI from "openai";

export async function callLLM({ provider, apiKey, systemprompt,userprompt, model }) {
  let baseURL;
  let defaultModel;

  switch (provider.toLowerCase()) {
    case "openai":
      baseURL = undefined;
      defaultModel = "gpt-4o";
      break;
    
    case "deepseek":
      baseURL = "https://api.deepseek.com";
      defaultModel = "deepseek-chat";
      break;

    case "openrouter":
    case "claude":
      baseURL = "https://openrouter.ai/api/v1";
      defaultModel = "anthropic/claude-3.5-sonnet";
      break;

    default:
      throw new Error(`Unsupported provider: "${provider}"`);
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const response = await client.chat.completions.create({
    model: model || defaultModel,
    messages: [
      { role: "system", content: systemprompt },
      { role: "user", content: userprompt }
    ],
  });

  return response.choices[0].message.content;
}