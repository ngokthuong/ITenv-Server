import asyncHandler from 'express-async-handler';
import { result } from '../services/leetcode.service';
import Problem from '../models/problem';
import pLimit from 'p-limit';

export const insertProblems = asyncHandler(async (req: any, res: any) => {
  try {
    const total = 3298;
    const limit = pLimit(50); // Limit the number of concurrent requests

    const fetchProblems = async (skip: number) => {
      const variables = {
        categorySlug: '',
        limit: 100,
        skip: skip,
        filters: {},
      };

      const graphqlQuery = `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              acRate
              difficulty
              freqBar
              frontendQuestionId: questionFrontendId
              isFavor
              paidOnly: isPaidOnly
              status

              title
              titleSlug
              content
              sampleTestCase
              exampleTestcases
              hints
              topicTags {
                name
                id
                slug
              }
              hasSolution
              hasVideoSolution
            }
          }
        }
      `;

      const response = await result('problemsetQuestionList', graphqlQuery, variables);
      return response.data.data.problemsetQuestionList.questions;
    };

    const fetchEditorData = async (titleSlug: string) => {
      const graphqlQueryEditor = `
        query questionEditorData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            codeSnippets {
              lang
              langSlug
              code
            }
            envInfo
            enableRunCode
          }
        }
      `;
      const variablesEditor = { titleSlug };
      const questionEditorResponse = await result(
        'questionEditorData',
        graphqlQueryEditor,
        variablesEditor,
      );
      return questionEditorResponse.data.data.question.codeSnippets;
    };

    const tasks = [];
    for (let skip = 0; skip < total; skip += 100) {
      tasks.push(
        limit(async () => {
          const questions = await fetchProblems(skip);
          for (const question of questions) {
            const codeEditorData = await fetchEditorData(question.titleSlug);
            console.log(question, codeEditorData);
            await Problem.create({
              title: question.title,
              slug: question.titleSlug,
              content: question.content,
              level: question.difficulty,
              hints: question.hints,
              tags: question.topicTags.map((t: any) => t.name),
              initialCode: codeEditorData,
            });
          }
        }),
      );
    }
    
    await Promise.all(tasks);

    // Send the response after all tasks have completed
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
