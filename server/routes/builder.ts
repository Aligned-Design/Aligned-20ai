import { RequestHandler } from "express";
import { generateBuilderContent } from "../workers/ai-generation";
import { AppError } from "../lib/error-middleware";
import { ErrorCode, HTTP_STATUS } from "../lib/error-responses";

export const generateContent: RequestHandler = async (req, res) => {
  try {
    const { prompt, contentType, provider } = req.body;

    if (!prompt || !contentType) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'Missing required fields: prompt, contentType',
        HTTP_STATUS.BAD_REQUEST,
        'warning',
        undefined,
        'Please provide both prompt and contentType in your request'
      );
    }

    const result = await generateBuilderContent({ prompt, agentType: contentType, provider });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Builder content generation failed:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Content generation failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'error',
      error instanceof Error ? { originalError: error.message } : undefined,
      'Please try again later or contact support'
    );
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
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Webhook processing failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'error',
      error instanceof Error ? { originalError: error.message } : undefined,
      'Please try again later or contact support'
    );
  }
};
