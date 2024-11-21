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

const total = 3298;
const limit = pLimit(40);

// Function to fetch problems
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

// Function to fetch editor data for a problem
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
  return questionEditorResponse.data.data.question;
};

// Function to insert problems into the database
export const insertProblems = async () => {
  console.log('problems');
  try {
    const tasks = [];
    for (let skip = 0; skip < total; skip += 100) {
      tasks.push(
        limit(async () => {
          const questions = await fetchProblems(skip);
          for (const question of questions) {
            if (question) {
              let tags: any[] = [];
              const codeEditorData = await fetchEditorData(question.titleSlug);

              for (const tag of question.topicTags) {
                const isExist = await Tag.findOne({ name: tag.name });
                if (!isExist) {
                  const newTag = await Tag.create({ name: tag.name, type: EnumTag.TYPE_PROBLEM });
                  tags.push(newTag._id);
                } else {
                  tags.push(isExist._id);
                }
              }

              if (!question.paidOnly) {
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
    await Promise.all(tasks);
  } catch (error: any) {
    throw new Error(error.message);
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

    const result = await Problem.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
      isDeleted: false,
    })
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select(
        '_id title level slug tags acceptance submitBy vote comment postAt createdAt frontendQuestionId',
      )
      .populate({
        path: 'tags',
        select: '_id name',
      });
    var total = await Problem.countDocuments({
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });

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
    console.log('problems')
    const users = await user.find({ isDeleted: false });

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

    // Sắp xếp mảng theo submitCount giảm dần
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
    console.log('Year:', year);
    console.log('Months:', months);

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1); // Ngày đầu tháng
      const endOfMonth = new Date(year, month, 0); // Ngày cuối tháng

      const total = await getProblemsDataDistributionByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }

    return results;
  } catch (error: any) {
    console.error('Error in getProblemsDataDistributionByYearService:', error.message);
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

    console.log('Total submissions in month:', total);
    return total;
  } catch (error: any) {
    console.error('Error in getProblemsDataDistributionByMonth:', error.message);
    throw new Error(error.message);
  }
};

