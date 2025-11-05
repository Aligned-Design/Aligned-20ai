import { RequestHandler } from "express";
import { generateWithAI, getAvailableProviders, getDefaultProvider, validateAIProviders } from "../workers/ai-generation";
import { AIGenerationRequest, AIGenerationResponse, AIProviderStatus } from "@shared/api";

export const generateContent: RequestHandler = async (req, res) => {
  try {
    if (!validateAIProviders()) {
      return res.status(500).json({
        error: "No AI providers configured",
        content: "",
        provider: "",
        agentType: ""
      });
    }

    const { prompt, agentType, provider } = req.body as AIGenerationRequest;

    if (!prompt || !agentType) {
      return res.status(400).json({
        error: "Missing required fields: prompt and agentType",
        content: "",
        provider: "",
        agentType: ""
      });
    }

    const content = await generateWithAI(prompt, agentType, provider);

    const response: AIGenerationResponse = {
      content,
      provider: provider || getDefaultProvider(),
      agentType
    };

    res.json(response);
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate content",
      content: "",
      provider: "",
      agentType: ""
    });
  }
};

export const getProviderStatus: RequestHandler = (req, res) => {
  const response: AIProviderStatus = {
    available: getAvailableProviders(),
    default: getDefaultProvider()
  };
  res.json(response);
};
