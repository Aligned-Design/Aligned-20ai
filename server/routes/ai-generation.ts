import { RequestHandler } from "express";
import {
  generateBuilderContent,
  generateDesignVisuals,
  validateAIProviders,
  getAvailableProviders
} from "../workers/ai-generation";

import type { AIGenerationRequest } from '@shared/api';

export const generateContent: RequestHandler = async (req, res) => {
  try {
    // Validate AI providers are configured
    if (!validateAIProviders()) {
      return res.status(500).json({
        error: 'No AI providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY'
      });
    }

    const { prompt, agentType, provider } = req.body as any;

    if (!prompt || !agentType) {
      return res.status(400).json({
        error: 'Missing required fields: prompt, agentType'
      });
    }

    const result = await generateBuilderContent({
      prompt,
      agentType,
      provider
    });

    res.json(result);
  } catch (error) {
    console.error('AI content generation failed:', error);
    res.status(500).json({
      error: 'Content generation failed',
      content: "",
      provider: "",
      agentType: ""
    });
  }
};

export const generateDesign: RequestHandler = async (req, res) => {
  try {
    // Validate AI providers are configured
    if (!validateAIProviders()) {
      return res.status(500).json({
        error: 'No AI providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY'
      });
    }

    const { prompt, provider } = req.body as AIGenerationRequest;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    const result = await generateDesignVisuals({
      prompt,
      agentType: "design",
      provider
    });

    res.json(result);
  } catch (error) {
    console.error('AI design generation failed:', error);
    res.status(500).json({
      error: 'Design generation failed',
      content: "",
      provider: "",
      agentType: "design"
    });
  }
};

export const getProviders: RequestHandler = (req, res) => {
  try {
    const providers = getAvailableProviders();
    
    res.json({
      success: true,
      providers,
      default: providers[0] || null
    });
  } catch (error) {
    console.error('Failed to get AI providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers',
      providers: [],
      default: null
    });
  }
};
