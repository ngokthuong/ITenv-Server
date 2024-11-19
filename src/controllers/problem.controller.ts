import asyncHandler from 'express-async-handler';
import { result } from '../services/leetcode.service';
import Problem, { IProblem } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { ResponseType } from '../types/Response.type';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { AverageProblemsPerUserService, getProblemsService, insertProblems } from '../services/problem.service';
import { AuthRequest } from '../types/AuthRequest.type';


// export const insertProblems = asyncHandler(async (req: any, res: any) => {
//   try {
//     const total = 3298;
//     const limit = pLimit(40); // Limit the number of concurrent requests

//     const fetchProblems = async (skip: number) => {
//       const variables = {
//         categorySlug: '',
//         limit: 100,
//         skip: skip,
//         filters: {},
//       };

//       const graphqlQuery = `
//         query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
//           problemsetQuestionList: questionList(
//             categorySlug: $categorySlug
//             limit: $limit

//             skip: $skip
//             filters: $filters
//           ) {
//             total: totalNum
//             questions: data {
//               acRate
//               difficulty
//               freqBar
//               frontendQuestionId: questionFrontendId
//               isFavor
//               paidOnly: isPaidOnly
//               status

//               title
//               titleSlug
//               content
//               sampleTestCase
//               exampleTestcases
//               hints
//               topicTags {
//                 name
//                 id
//                 slug
//               }
//               hasSolution
//               hasVideoSolution
//             }
//           }
//         }
//       `;

//       const response = await result('problemsetQuestionList', graphqlQuery, variables);
//       return response.data.data.problemsetQuestionList.questions;
//     };

//     const fetchEditorData = async (titleSlug: string) => {
//       const graphqlQueryEditor = `
//         query questionEditorData($titleSlug: String!) {
//           question(titleSlug: $titleSlug) {
//             questionId
//             questionFrontendId
//             codeSnippets {
//               lang
//               langSlug
//               code
//             }
//             envInfo
//             enableRunCode
//           }
//         }
//       `;
//       const variablesEditor = { titleSlug };
//       const questionEditorResponse = await result(
//         'questionEditorData',
//         graphqlQueryEditor,
//         variablesEditor,
//       );
//       return questionEditorResponse.data.data.question.codeSnippets;
//     };

//     const tasks = [];
//     for (let skip = 0; skip < total; skip += 100) {
//       tasks.push(
//         limit(async () => {
//           const questions = await fetchProblems(skip);
//           for (const question of questions) {
//             if (question) {
//               let tags: any[] = [];

//               const codeEditorData = await fetchEditorData(question.titleSlug);
//               for (const tag of question.topicTags) {
//                 const isExist = await Tag.findOne({ name: tag.name });
//                 if (!isExist) {
//                   const newTag = await Tag.create({ name: tag.name, type: EnumTag.TYPE_PROBLEM });
//                   tags.push(newTag._id);
//                 } else {
//                   tags.push(isExist._id);
//                 }
//               }
//               !question.paidOnly &&
//                 (await Problem.create({
//                   title: question.title,
//                   slug: question.titleSlug,
//                   content: question.content,
//                   level: question.difficulty as EnumLevelProblem,
//                   hints: question.hints,
//                   status: question.status || false,
//                   tags: tags,
//                   initialCode: codeEditorData,
//                 }));
//             }
//           }
//         }),
//       );
//     }
//     await Promise.all(tasks);
//     // Send the response after all tasks have completed
//     res.status(200).json({ message: 'success' });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

export const insertProblemsController = asyncHandler(async (req: any, res: any) => {
  try {
    await insertProblems();
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

export const getProblemsController = asyncHandler(async (req: any, res: any) => {
  const queryOption = req.query;
  const { result, total } = await getProblemsService(queryOption);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
    total
  };
  return res.status(200).json(response);
});

export const getSingleProblem = asyncHandler(async (req: any, res: any) => {
  const { slug } = req.params;
  try {
    const problem = await Problem.findOne({ slug: slug, isDeleted: false });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    let response: ResponseType<IProblem> = {
      data: problem,
      success: true,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const commentController = asyncHandler(async (req: any, res: any) => {
  const { problemId } = req.params;
  const { comment } = req.body;
  try {
    const problem = await Problem.findOneAndUpdate(
      { _id: problemId },
      { $push: { comment: comment } },
      { new: true },
    );
  } catch (error) {
    console.log(error);
  }
});



// ----------------------------------------------------------ADMIN----------------------------------------------------------------------

export const AverageProblemsPerUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  const avgTotal = await AverageProblemsPerUserService();
  const response: ResponseType<typeof avgTotal> = {
    success: true,
    total: avgTotal,
  };
  return res.status(200).json(response);
})
