import { RequestHandler } from "express";
import { generateBuilderContent } from "../workers/ai-generation";

export const generateContent: RequestHandler = async (req, res) => {
  try {
    const { prompt, contentType, provider } = req.body;
    
    if (!prompt || !contentType) {
      return res.status(400).json({ 
        error: 'Missing required fields: prompt, contentType' 
      });
    }

    const result = await generateBuilderContent({ prompt, agentType: contentType, provider });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Builder content generation failed:', error);
    res.status(500).json({
      error: 'Content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const builderWebhook: RequestHandler = async (req, res) => {
  try {
    // Handle Builder.io webhooks (content updates, etc.)
    const { type, data } = req.body;
    
    console.log('Builder.io webhook received:', type, data);
    
    // Process webhook based on type
    switch (type) {
      case 'content.update':
        // Handle content updates
        break;
      case 'content.publish':
        // Handle content publishing
        break;
      default:
        console.log('Unknown webhook type:', type);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Builder webhook failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
