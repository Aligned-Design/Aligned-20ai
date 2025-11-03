import { RequestHandler } from "express";
import { createAIProvider } from "../lib/ai";

export const generateContent: RequestHandler = async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = createAIProvider();
    const content = await ai.generateContent(prompt, options);

    res.json({ content });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const analyzeContent: RequestHandler = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const ai = createAIProvider();
    const analysis = await ai.analyzeContent(content);

    res.json({ analysis });
  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
