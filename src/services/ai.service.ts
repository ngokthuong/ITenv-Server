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
      return await this.chain.stream({ input });
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
          const outputs = tc.output.join(', ');
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
}
