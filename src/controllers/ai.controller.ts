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
