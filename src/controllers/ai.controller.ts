import { Request, Response } from 'express';
import { LangchainService } from '../services/ai.service';

const langchainService = new LangchainService(process.env.OPENAI_API_KEY || '');

export const refactorCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, lang } = req.body;

    if (!problemId || !code || !lang) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemId, code, and lang are required',
      });
    }

    const refactoredCode = await langchainService.refactorCode(problemId, code, lang);

    return res.status(200).json({
      success: true,
      data: {
        refactoredCode,
      },
    });
  } catch (error: any) {
    console.error('Error in refactorCode controller:', error);
    return res.status(error.message === 'Problem not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const reviewCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, lang } = req.body;

    if (!problemId || !code || !lang) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemId, code, and lang are required',
      });
    }

    const reviewResult = await langchainService.reviewCode(problemId, code, lang);

    return res.status(200).json({
      success: true,
      data: reviewResult,
    });
  } catch (error: any) {
    console.error('Error in reviewCode controller:', error);
    return res.status(error.message === 'Problem not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const generateStreamingResponse = async (req: Request, res: Response) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: input is required',
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get the streaming response
    const stream = await langchainService.generateStreamingResponse(input);

    // Handle the stream
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    // End the response
    res.end();
  } catch (error: any) {
    console.error('Error in generateStreamingResponse controller:', error);
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
    // If headers have been sent, end the stream with an error
    res.write(`data: ${JSON.stringify({ error: error.message || 'Internal server error' })}\n\n`);
    res.end();
  }
};
