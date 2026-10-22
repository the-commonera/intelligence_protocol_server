
export async function callLLM(
  provider,
  apikey,
  systemprompt,
  userprompt,
  model
) {

  console.log(`Provider: ${provider}`);
  console.log(`Model: ${model}`);
  console.log(`System Prompt: ${systemprompt}`);
  console.log(`User Prompt: ${userprompt}`);
  console.log(`API Key: ${apikey}`);


  switch (provider) {

    case "openai": {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apikey });

      const response = await client.chat.completions.create({
        model: model || "gpt-4o",
        messages: [
          { role: "system", content: systemprompt },
          { role: "user", content: userprompt }
        ]
      });

      return response.choices[0].message.content;
    }

    case "groq": {


      console.log(apikey)
      const { default: Groq } = await import("groq-sdk");
      const client = new Groq({apiKey: apikey });

      const response = await client.chat.completions.create({
        model: model || "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: systemprompt },
          { role: "user", content: userprompt }
        ]
      });

      return response.choices[0].message.content;
    }

    case "deepseek": {
      const { default: DeepSeek } = await import("@deepseek-ai/sdk");

      // Replace with the actual constructor and method
      // documented by the DeepSeek SDK you install.
      const client = new DeepSeek({ apikey });

      throw new Error(
        "Implement the request using the installed DeepSeek SDK API."
      );
    }

    case "openrouter": {
      const { OpenRouter } = await import("@openrouter/sdk");
      const client = new OpenRouter({ apikey });

      const response = await client.chat.send({
        model: model || "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: systemprompt },
          { role: "user", content: userprompt }
        ]
      });

      return response.choices[0].message.content;
    }

    case "claude": {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apikey });

      const response = await client.messages.create({
        model: model || "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemprompt,
        messages: [
          { role: "user", content: userprompt }
        ]
      });

      return response.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("");
    }

    default:
      throw new Error(`Unsupported provider: "${provider}"`);
  }
}
