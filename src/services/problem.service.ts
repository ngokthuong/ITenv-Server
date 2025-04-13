import { result } from '../services/leetcode.service';
import Problem, { IProblem } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { QueryOption } from '../types/QueryOption.type';
import { getAllUsersService } from './user.service';
import axios from 'axios';
import { SubmissionBody } from '../types/ProblemType.type';
import user from '../models/user';
import submission from '../models/submission';
import problem from '../models/problem';

const total = 10;
const limit = pLimit(2);

// Function to fetch problems
const fetchProblems = async (skip: number) => {
  try {
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
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Function to fetch editor data for a problem
const fetchEditorData = async (titleSlug: string) => {
  try {
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
    return questionEditorResponse.data.data.question;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Function to insert problems into the database
export const insertProblems = async () => {
  console.log('problems');
  try {
    const tasks = [];
    for (let skip = 0; skip < total; skip += 1) {
      tasks.push(
        limit(async () => {
          const questions = await fetchProblems(skip);
          console.log('questions.');
          console.log(questions);
          for (const question of questions) {
            if (question) {
              let tags: any[] = [];
              const codeEditorData = await fetchEditorData(question.titleSlug);
              if (!codeEditorData) {
                console.log('No editor data for', question.titleSlug);
                continue;
              }
              for (const tag of question.topicTags) {
                console.log('questions');
                console.log(tag.name);
                const isExist = await Tag.findOne({ name: tag.name });
                console.log('isExist');
                console.log(isExist);

                if (!isExist) {
                  console.log('push1');
                  const newTag = await Tag.create({ name: tag.name, type: EnumTag.TYPE_PROBLEM });
                  console.log('push1');
                  tags.push(newTag._id);
                } else {
                  console.log('push2');
                  tags.push(isExist._id);
                }
              }

              if (!question.paidOnly) {
                console.log('save');
                await Problem.create({
                  title: question.title,
                  slug: question.titleSlug,
                  content: question.content,
                  level: question.difficulty as EnumLevelProblem,
                  hints: question.hints,
                  exampleTestcases: question.exampleTestcases,
                  frontendQuestionId: question.frontendQuestionId,
                  questionId: codeEditorData.questionId,
                  status: question.status || false,
                  tags: tags,
                  initialCode: codeEditorData.codeSnippets,
                });
              }
            }
          }
        }),
      );
    }
    return await Promise.all(tasks);
  } catch (error: any) {
    console.error('Insert problems failed:', error);
    throw new Error(`Insert problems failed: ${error.message}`);
  }
};

export const getProblemsService = async (queryOption: QueryOption) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const skip = (page - 1) * limit;
    const search = queryOption?.search || '';
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'DESC';
    const tags = queryOption.tags || [];
    const query: any = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    };

    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
    const result = await Problem.find(query)
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select(
        '_id title level slug tags acceptance submitBy vote comment postAt createdAt frontendQuestionId isDeleted',
      )
      .populate({
        path: 'tags',
        select: '_id name',
      });
    var total = await Problem.countDocuments(query);

    return { result, total };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const runCode = async (
  name: string,
  submissionBody: SubmissionBody & { data_input: string },
) => {
  try {
    console.log('Submitting problem:', name, submissionBody);
    const response = await axios.post(
      `https://leetcode.com/problems/${name}/interpret_solution/`,
      {
        lang: submissionBody.lang,
        typed_code: submissionBody.typed_code,
        question_id: submissionBody.question_id,
        data_input: submissionBody.data_input,
      },
      {
        headers: {
          Host: 'leetcode.com',
          Origin: 'https://leetcode.com',
          'Content-Type': 'application/json',
          'x-csrftoken': process.env.CSRF_TOKEN,
          Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}; csrftoken=${process.env.CSRF_TOKEN}`,
          Referer: `https://leetcode.com/problems/${name}/interpret_solution/`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Error during submission:', error);
    throw error;
  }
};

export const submit = async (name: string, submissionBody: SubmissionBody) => {
  try {
    console.log('Submitting problem:', name, submissionBody);
    const response = await axios.post(
      `https://leetcode.com/problems/${name}/submit/`,
      {
        lang: submissionBody.lang,
        typed_code: submissionBody.typed_code,
        question_id: submissionBody.question_id,
      },
      {
        headers: {
          Host: 'leetcode.com',
          Origin: 'https://leetcode.com',
          'Content-Type': 'application/json',
          'x-csrftoken': process.env.CSRF_TOKEN,
          Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}; csrftoken=${process.env.CSRF_TOKEN}`,
          Referer: `https://leetcode.com/problems/${name}/submit/`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Error during submission:', error);
    throw error;
  }
};

export const checkSubmissionStatus = async (submissionId: string, titleSlug: string) => {
  try {
    console.log(submissionId, titleSlug);
    const response = await axios.get(
      `https://leetcode.com/submissions/detail/${submissionId}/check/`,

      {
        headers: {
          Host: 'leetcode.com',
          Origin: 'https://leetcode.com',
          'Content-Type': 'application/json',
          'x-csrftoken': process.env.CSRF_TOKEN,
          Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}; csrftoken=${process.env.CSRF_TOKEN}`,
          Referer: `https://leetcode.com/problems/${titleSlug}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const submissionDetail = async (submissionId: number) => {
  const graphqlQuery = `query submissionDetails($submissionId: Int!) {
  submissionDetails(submissionId: $submissionId) {
    runtime
    runtimeDisplay
    runtimePercentile
    runtimeDistribution
    memory
    memoryDisplay
    memoryPercentile
    memoryDistribution
    code
    timestamp
    statusCode
    user {
      username
      profile {
        realName
        userAvatar
      }
    }
    lang {
      name
      verboseName
    }
    question {
      questionId
      titleSlug
      hasFrontendPreview
    }
    notes
    flagType
    topicTags {
      tagId
      slug
      name
    }
    runtimeError
    compileError
    lastTestcase
    codeOutput
    expectedOutput
    totalCorrect
    totalTestcases
    fullCodeOutput
    testDescriptions
    testBodies
    testInfo
    stdOutput
  }
}`;

  const variables = { submissionId: submissionId };
  try {
    const submissionDetail = await result('submissionDetails', graphqlQuery, variables);
    return submissionDetail;
  } catch (error) {
    console.error(error);
  }
};

// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
export const activeUsers = async () => {
  try {
    const result = await Problem.aggregate([
      {
        $match: {
          acceptance: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: '$acceptance',
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: '$acceptance' },
        },
      },
      {
        $project: {
          totalUsers: { $size: '$uniqueUsers' },
        },
      },
    ]);

    return result[0]?.totalUsers || 0;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const AverageProblemsPerUserService = async () => {
  try {
    const totalSolvedProblems = await Problem.countDocuments({
      acceptance: { $exists: true, $ne: [] }, // Các bài toán có acceptance không rỗng
    });
    const total = await activeUsers();
    if (total === 0) return 0;
    const result = Math.round(totalSolvedProblems / total);
    return result;
  } catch (error: any) {
    console.error('Error in AverageProblemsPerUserService:', error.message);
    throw new Error(error.message);
  }
};

// --------------------------------------------------------ADMIN----------------------------------------------------------------------
export const getTotalActiveProblemsService = async () => {
  try {
    const total = await Problem.countDocuments({ isDeleted: false });
    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const upSertProblemService = async (payload: IProblem) => {
  try {
    const result = await Problem.findOneAndUpdate(
      { questionId: payload.questionId },
      { $set: payload },
      { upsert: true, new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTotalProblemsService = async () => {
  try {
    const total = await Problem.countDocuments({});
    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTopProblemSolversService = async () => {
  try {
    console.log('problems');
    const users = await user.find({ isDeleted: false }).select('_id username');

    const topProblemResolvers = [];

    for (const user of users) {
      try {
        const submitCount = await submission.countDocuments({
          submitBy: user._id,
          isAccepted: true,
        });
        const userWithSubmitCount = { ...user.toObject(), submitCount }; // Sử dụng toObject() để tránh vấn đề với các thuộc tính Mongoose

        topProblemResolvers.push(userWithSubmitCount);
      } catch (error: any) {
        console.error(`Error counting submissions for user ${user._id}:`, error.message);
      }
    }

    topProblemResolvers.sort((a, b) => b.submitCount - a.submitCount);

    const top10 = topProblemResolvers.slice(0, 10);

    return top10;
  } catch (error: any) {
    throw new Error(`Failed to get top problem solvers: ${error.message}`);
  }
};

export const getProblemsDataDistributionByYearService = async (queryOption: QueryOption) => {
  try {
    const year = queryOption.year || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    let results: any[] = [];

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const total = await getProblemsDataDistributionByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }

    return results;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getProblemsDataDistributionByMonth = async (startOfMonth: Date, endOfMonth: Date) => {
  try {
    const total = await submission.countDocuments({
      isDeleted: false,
      isAccepted: true,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllTotalDataInProblemPageService = async () => {
  try {
    const totalProblems = await getTotalProblemsService();
    const resolvedProblems = await getresolvedProblemsService();
    const totalActivePorblems = await getTotalActiveProblemsService();
    const totalBlockedProblems = await getTotalBlockedProblemsService();
    const data = {
      totalProblems,
      resolvedProblems,
      totalActivePorblems,
      totalBlockedProblems,
    };

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getTotalBlockedProblemsService = async () => {
  try {
    const result = await problem.countDocuments({ isDeleted: true });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getresolvedProblemsService = async () => {
  try {
    const result = await problem.countDocuments({ acceptance: { $ne: null } });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deletedProblemsByAdminService = async (_id: string) => {
  try {
    const result = await problem.findOneAndUpdate({ _id }, { isDeleted: true }, { new: true });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDailysolvedProblemsService = async () => {
  try {
    const today = new Date();
    const sevenDaysArray: any[] = [];
    const result: any[] = [];
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    for (let i = 1; i <= 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      sevenDaysArray.push(day);
    }

    for (let i = 0; i < sevenDaysArray.length; i++) {
      const currentDay = new Date(sevenDaysArray[i]);
      const startOfDay = new Date(currentDay);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDay);
      endOfDay.setHours(23, 59, 59, 999);
      const totalProblems = await getSubmistedProblemsByDate(startOfDay, endOfDay);
      const dayIndex = startOfDay.getDay();
      result.push({ DayOfWeek: daysOfWeek[dayIndex], total: totalProblems });
    }
    return result.reverse();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getSubmistedProblemsByDate = async (startOfDay: Date, endOfDay: Date) => {
  try {
    const result = await submission.countDocuments({
      isDeleted: false,
      isAccepted: true,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
