import asyncHandler from 'express-async-handler';
import { result } from '../services/leetcode.service';
import Problem, { IProblem } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { ResponseType } from '../types/Response.type';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import {
  AverageProblemsPerUserService,
  deletedProblemsByAdminService,
  getAllTotalDataInProblemPageService,
  getDailysolvedProblemsService,
  getProblemsDataDistributionByYearService,
  getProblemsService,
  getTopProblemSolversService,
  getTotalActiveProblemsService,
  getTotalProblemsService,
  insertProblems,
} from '../services/problem.service';
import {
  checkSubmissionStatus,
  runCode,
  submissionDetail,
  submit,
} from '../services/problem.service';
import { AuthRequest } from '../types/AuthRequest.type';
import { SubmissionBody } from '../types/ProblemType.type';
import axios from 'axios';
import submission from '../models/submission';
import problem from '../models/problem';

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
    total,
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

export const runCodeController = asyncHandler(async (req: any, res: any) => {
  const { lang, question_id, typed_code, data_input } = req.body;
  const { name: titleSlug } = req.params;
  if (!titleSlug || !lang || !question_id || !typed_code || !data_input) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!process.env.CSRF_TOKEN || !process.env.LEETCODE_SESSION) {
    return res.status(500).json({ message: 'Missing environment variables.' });
  }
  try {
    const submissionBody: SubmissionBody & { data_input: string } = {
      lang,
      typed_code,
      question_id,
      data_input,
    };
    const response = await runCode(titleSlug, submissionBody);
    const interpret_id = response?.data?.interpret_id;
    let status = await checkSubmissionStatus(interpret_id, titleSlug);
    const maxRetries = 60;
    let retryCount = 0;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      status = await checkSubmissionStatus(interpret_id, titleSlug);
      retryCount += 1;
      console.log('retry ' + retryCount, status);
    } while (
      (status?.data?.state === 'PENDING' || status?.data?.state === 'STARTED') &&
      retryCount < maxRetries
    );

    if (retryCount >= maxRetries) {
      return res.status(408).json({ message: 'Submission status check timed out.' });
    }
    return res.status(200).json({ success: true, data: status?.data });
  } catch (error) {
    console.error('Error submitting problem:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      res.status(error.response?.status || 500).json({
        message: error.response?.data || 'An error occurred while submitting the problem.',
      });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred.',
      });
    }
  }
});

export const submitProblemController = asyncHandler(async (req: AuthRequest, res: any) => {
  const { lang, question_id, typed_code } = req.body;
  const { name: titleSlug } = req.params; // Validae input
  const { userId } = req.user!;
  if (!titleSlug || !lang || !question_id || !typed_code) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!process.env.CSRF_TOKEN || !process.env.LEETCODE_SESSION) {
    return res.status(500).json({ message: 'Missing environment variables.' });
  }
  try {
    const submissionBody: SubmissionBody = {
      lang,
      typed_code,
      question_id,
    };
    const response = await submit(titleSlug, submissionBody);
    const submissionId = response?.data?.submission_id;
    let status = await checkSubmissionStatus(submissionId, titleSlug);
    const maxRetries = 60;
    let retryCount = 0;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      status = await checkSubmissionStatus(submissionId, titleSlug);
      retryCount += 1;
      console.log('retry ' + retryCount, status);
    } while (
      (status?.data?.state === 'PENDING' || status?.data?.state === 'STARTED') &&
      retryCount < maxRetries
    );

    if (retryCount >= maxRetries) {
      return res.status(408).json({ message: 'Submission status check timed out.' });
    }
    const submissionDetailResponse = await submissionDetail(submissionId);
    if (!submissionDetailResponse)
      return res.status(400).json({ success: false, message: 'Submission detail not found' });
    const problem = await Problem.findOne({ slug: titleSlug });
    console.log('log', submissionDetailResponse?.data?.data?.submissionDetails);
    await submission.create({
      problem: problem?._id,
      submitBy: userId,
      submissionLeetcodeId: submissionId,
      isAccepted:
        !submissionDetailResponse?.data?.data?.submissionDetails?.runtimeError &&
        !submissionDetailResponse?.data?.data?.submissionDetails?.compileError &&
        submissionDetailResponse?.data?.data?.submissionDetails?.totalCorrect ===
          submissionDetailResponse?.data?.data?.submissionDetails?.totalTestcases
          ? true
          : false,
    });

    return res.status(200).json({ success: true, data: status?.data });
  } catch (error) {
    console.error('Error submitting problem:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      res.status(error.response?.status || 500).json({
        message: error.response?.data || 'An error occurred while submitting the problem.',
      });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred.',
      });
    }
  }
});

export const getDetailSubmissionController = asyncHandler(async (req: any, res: any) => {
  const { submissionId } = req.params;
  try {
    const submissionDetailResponse = await submissionDetail(+submissionId);
    if (!submissionDetailResponse)
      res.status(400).json({ success: false, message: 'Submission detail not found' });
    else
      res
        .status(submissionDetailResponse?.status)
        .json({ success: true, data: submissionDetailResponse?.data?.data?.submissionDetails });
  } catch (error) {
    console.error('Error fetching submission detail:', error);
    res.status(500).json({ message: 'An error occurred while fetching submission detail.' });
  }
});

export const getSubmissionsByUserIdController = asyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const submissions = await submission
      .find({ submitBy: userId })
      .populate('problem', '_id title slug');
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'An error occurred while fetching submissions.' });
  }
});
export const getProblemActivitiesController = asyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;
  const { year } = req.query || 2024;

  try {
    if (!year || isNaN(year)) {
      return res.status(400).json({ message: 'Invalid year provided' });
    }
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const activities = await submission
      .find({
        submitBy: userId,
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      })
      .select('createdAt -_id');
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error });
  }
});
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------

export const AverageProblemsPerUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  const avgTotal = await AverageProblemsPerUserService();
  const response: ResponseType<typeof avgTotal> = {
    success: true,
    data: avgTotal,
  };
  return res.status(200).json(response);
});

export const getTotalActiveProblemsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const total = await getTotalActiveProblemsService();
  const response: ResponseType<typeof total> = {
    success: true,
    data: total,
  };
  return res.status(200).json(response);
});

export const getTotalProblemsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const total = await getTotalProblemsService();
  const response: ResponseType<typeof total> = {
    success: true,
    data: total,
  };
  return res.status(200).json(response);
});

export const getTopProblemSolversController = asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await getTopProblemSolversService();
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const getProblemsDataDistributionByYearController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const queryOption = req.query;
    const result = await getProblemsDataDistributionByYearService(queryOption);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  },
);

export const getAllTotalDataInProblemPageController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const result = await getAllTotalDataInProblemPageService();
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  },
);

export const deletedProblemsByAdminController = asyncHandler(async (req: AuthRequest, res: any) => {
  const _id = req.params._id;
  const result = await deletedProblemsByAdminService(_id);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const getDailysolvedProblemsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await getDailysolvedProblemsService();
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});
