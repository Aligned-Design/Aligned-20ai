import { RequestHandler } from "express";
import { generateWithAI, getAvailableProviders, getDefaultProvider, validateAIProviders } from "../workers/ai-generation";
import { AIGenerationRequest, AIGenerationResponse, AIProviderStatus, ErrorResponse } from "@shared/api";

export const generateContent: RequestHandler = async (req, res) => {
  try {
    if (!validateAIProviders()) {
      const errorResponse: ErrorResponse = {
        error: "No AI providers configured",
        details: "Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variables"
      };
      return res.status(500).json(errorResponse);
    }

    const { prompt, agentType, provider }: AIGenerationRequest = req.body;

    if (!prompt || !agentType) {
      const errorResponse: ErrorResponse = {
        error: "Missing required fields",
        details: "prompt and agentType are required"
      };
      return res.status(400).json(errorResponse);
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
    const errorResponse: ErrorResponse = {
      error: "Failed to generate content",
      details: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(500).json(errorResponse);
  }
};

export const getProviderStatus: RequestHandler = (req, res) => {
  const response: AIProviderStatus = {
    available: getAvailableProviders(),
    default: getDefaultProvider()
  };
  res.json(response);
};
