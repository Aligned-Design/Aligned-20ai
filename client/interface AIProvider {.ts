interface AIProvider {
  generateContent(
    prompt: string,
    options?: Record<string, any>,
  ): Promise<string>;
  analyzeContent(content: string): Promise<unknown>;
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.apiKey = apiKey;
  }

  async generateContent(
    prompt: string,
    options: Record<string, any> = {},
  ): Promise<string> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model || "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant for marketing content generation.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async analyzeContent(content: string): Promise<unknown> {
    const prompt = `Analyze the following marketing content for sentiment, engagement potential, and provide actionable improvement suggestions:\n\n${content}`;
    const analysis = await this.generateContent(prompt);

    return {
      sentiment: "positive",
      engagementScore: 85,
      suggestions: [analysis],
      analysis,
    };
  }
}

class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Anthropic API key is required");
    }
    this.apiKey = apiKey;
  }

  async generateContent(
    prompt: string,
    options: Record<string, any> = {},
  ): Promise<string> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: options.model || "claude-3-sonnet-20240229",
          max_tokens: options.maxTokens || 1000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || "";
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw error;
    }
  }

  async analyzeContent(content: string): Promise<unknown> {
    const prompt = `Analyze the following marketing content for sentiment, engagement potential, and provide actionable improvement suggestions:\n\n${content}`;
    const analysis = await this.generateContent(prompt);

    return {
      sentiment: "positive",
      engagementScore: 85,
      suggestions: [analysis],
      analysis,
    };
  }
}

// AI Service Factory
export function createAIProvider(provider?: string): AIProvider {
  const aiProvider = provider || process.env.AI_PROVIDER || "openai";

  switch (aiProvider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider(process.env.OPENAI_API_KEY!);
    case "anthropic":
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY!);
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}

// Default export
export const ai = createAIProvider();
