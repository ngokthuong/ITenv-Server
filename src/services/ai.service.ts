import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import Problem from '../models/problem';

export class LangchainService {
  private model: ChatOpenAI;
  private chain: RunnableSequence;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: Number(process.env.TEMERATURE) || 0.7,
      modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo',
    });

    // Create a prompt template
    const prompt = PromptTemplate.fromTemplate(
      `You are a helpful AI assistant. Please help with the following request:
      
      {input}
      
      Provide a clear and concise response:`,
    );

    // Build the chain using LCEL
    this.chain = RunnableSequence.from([prompt, this.model, new StringOutputParser()]);
  }

  async generateResponse(input: string): Promise<string> {
    try {
      const response = await this.chain.invoke({ input });
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async generateStreamingResponse(input: string) {
    try {
      const expertPrompt = PromptTemplate.fromTemplate(
        `You are an expert IT professional with deep knowledge in software development, programming, and technology. Please help with the following request while adhering to these guidelines:

        1. Honorifics: Use appropriate honorifics (Mr., Ms., Dr.) when addressing users. When communicating in Vietnamese, use polite particles (ạ, vâng, dạ) to show respect.

        2. Content Restrictions:
           - Do not provide code snippets
           - Do not answer questions about violence, sex, racism, or inappropriate topics
           - Focus on professional IT and technology topics

        3. Support Scope:
           - Answer questions related to software development
           - Provide guidance on programming concepts
           - Explain technical concepts clearly
           - Share best practices in IT

        4. Attitude and Style:
           - Maintain a professional, friendly, and helpful demeanor
           - Be patient and clear in explanations
           - Use technical terms appropriately
           - Provide structured and organized responses

        5. Handling Missing Information:
           If you cannot find specific information, respond with:
           "I apologize, but I cannot find detailed information about [query] in the current knowledge base. Please provide more details or rephrase your question."

        User Request:
        {input}

        Please provide a clear and professional response:`,
      );

      const expertChain = RunnableSequence.from([
        expertPrompt,
        this.model,
        new StringOutputParser(),
      ]);

      return await expertChain.stream({ input });
    } catch (error) {
      console.error('Error generating streaming response:', error);
      throw error;
    }
  }

  async refactorCode(problemId: string, code: string, lang: string): Promise<string> {
    try {
      // Get problem details
      const problem = await Problem.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      // Get visible test cases
      const visibleTestCases = problem.testCase?.filter((tc) => !tc.isHidden) || [];
      const testCasesStr = visibleTestCases
        .map((tc) => {
          const inputs = tc.input.map((input) => `${input.name}: ${input.value}`).join(', ');
          const outputs = tc.output;
          return `Input: ${inputs}\nExpected Output: ${outputs}`;
        })
        .join('\n\n');
      const refactorPrompt = PromptTemplate.fromTemplate(
        `You are an expert code refactoring assistant. Please help refactor the following code while maintaining its functionality to solve the problem.

        Problem Description:
        {problemDescription}

        Test Cases (to ensure exact functionality):
        {testCases}

        Original Code:
        {code}

        Programming Language: {lang}

        Please refactor the code to:
        1. Improve readability and maintainability
        2. Follow best practices for {lang}
        3. Maintain the same functionality to solve the problem (must pass all test cases exactly)
        4. Add helpful comments where necessary
        5. Optimize performance if possible

        Provide only the refactored code without any additional explanation:`,
      );

      const refactorChain = RunnableSequence.from([
        refactorPrompt,
        this.model,
        new StringOutputParser(),
      ]);

      const response = await refactorChain.invoke({
        problemDescription: problem.content,
        testCases: testCasesStr,
        code,
        lang,
      });

      return response;
    } catch (error) {
      console.error('Error refactoring code:', error);
      throw error;
    }
  }

  async reviewCode(
    code: string,
    lang: string,
    problemId: string,
  ): Promise<{
    overallScore: number;
    feedback: string;
    suggestions: string[];
    bestPractices: string[];
    complexityAnalysis: {
      timeComplexity: string;
      spaceComplexity: string;
      bigONotation: string;
    };
    memoryUsage: {
      estimatedMemory: string;
      potentialMemoryIssues: string[];
    };
    algorithmSuitability: {
      isOptimal: boolean;
      alternativeApproaches: string[];
      reasoning: string;
    };
  }> {
    try {
      // Get problem details
      const problem = await Problem.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      // Get visible test cases
      const visibleTestCases = problem.testCase?.filter((tc) => !tc.isHidden) || [];
      const testCasesStr = visibleTestCases
        .map((tc) => {
          const inputs = tc.input.map((input) => `${input.name}: ${input.value}`).join(', ');
          const outputs = tc.output;
          return `Input: ${inputs}\nExpected Output: ${outputs}`;
        })
        .join('\n\n');
      console.log('content: ', problem.content);
      console.log('testcases: ', testCasesStr);
      console.log('code: ', code), console.log('lang: ', lang);
      const reviewPrompt = PromptTemplate.fromTemplate(
        `You are an expert code reviewer and algorithm analyst. Please review the following code and provide a detailed analysis.

        Problem Description:
        {problemDescription}

        Test Cases:
        {testCases}

        Code to Review:
        {code}

        Programming Language: {lang}

        Please provide a comprehensive code review that includes:
        1. An overall score from 1-10
        2. Detailed feedback on code quality
        3. Specific suggestions for improvement
        4. Best practices that should be followed
        5. Time and Space Complexity Analysis
        6. Memory Usage Analysis
        7. Algorithm Suitability Analysis

        Format your response as a JSON object with the following structure:
        {{
          "overallScore": number,
          "feedback": string,
          "suggestions": string[],
          "bestPractices": string[],
          "complexityAnalysis": {{
            "timeComplexity": string,
            "spaceComplexity": string,
            "bigONotation": string
      }},
          "memoryUsage": {{
            "estimatedMemory": string,
            "potentialMemoryIssues": string[]
          }},
          "algorithmSuitability": {{
            "isOptimal": boolean,
            "alternativeApproaches": string[],
            "reasoning": string
          }}
      }}`,
      );

      const reviewChain = RunnableSequence.from([
        reviewPrompt,
        this.model,
        new StringOutputParser(),
      ]);

      const response = await reviewChain.invoke({
        problemDescription: problem.content,
        testCases: testCasesStr,
        code,
        lang,
      });
      console.log('review response: ', response);
      // Parse the JSON response
      const reviewResult = JSON.parse(response);
      return reviewResult;
    } catch (error) {
      console.error('Error reviewing code:', error);
      throw error;
    }
  }
}
