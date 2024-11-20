import { result } from '../services/leetcode.service';
import Problem, { IProblem } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { QueryOption } from '../types/QueryOption.type';
import { getAllUsersService } from './user.service';
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
  return questionEditorResponse.data.data.question.codeSnippets;
};

// Function to insert problems into the database
export const insertProblems = async () => {
  console.log('problems')
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
                  status: question.status || false,
                  tags: tags,
                  initialCode: codeEditorData,
                });
              }
            }
          }
        })
      );
    }
    await Promise.all(tasks);
  } catch (error: any) {
    throw new Error(error.message)
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
      .select('_id title level slug tags acceptance submitBy vote comment postAt createdAt')
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
}

// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
export const activeUsers = async () => {
  try {
    const result = await Problem.aggregate([
      {
        $match: {
          acceptance: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: "$acceptance"
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: "$acceptance" }
        }
      },
      {
        $project: {
          totalUsers: { $size: "$uniqueUsers" }
        }
      }
    ]);

    return result[0]?.totalUsers || 0;

  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const AverageProblemsPerUserService = async () => {
  try {
    const totalSolvedProblems = await Problem.countDocuments({
      acceptance: { $exists: true, $ne: [] }
    });
    const total = await activeUsers();
    if (total === 0) return 0;
    const result = Math.round(totalSolvedProblems / total);
    return result;
  } catch (error: any) {
    console.error('Error in AverageProblemsPerUserService:', error.message);
    throw new Error(error.message)
  }
}

// --------------------------------------------------------ADMIN----------------------------------------------------------------------
export const getTotalActiveProblemsService = async () => {
  try {
    const total = await Problem.countDocuments({ isDeleted: false })
    return total;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getTotalProblemsService = async () => {
  try {
    const total = await Problem.countDocuments({})
    return total;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getTopProblemSolversService = async () => {
  try {
    const users = await user.find({ isDeleted: false });

    const topProblemResolvers = [];

    for (const user of users) {
      try {
        const submitCount = await submission.countDocuments({
          submitBy: user._id,
          isAccepted: true,
        });
        const userWithSubmitCount = { ...user.toObject(), submitCount };  // Sử dụng toObject() để tránh vấn đề với các thuộc tính Mongoose

        topProblemResolvers.push(userWithSubmitCount);
      } catch (error: any) {
        console.error(`Error counting submissions for user ${user._id}:`, error.message);
      }
    }

    // Sắp xếp mảng theo submitCount giảm dần
    topProblemResolvers.sort((a, b) => b.submitCount - a.submitCount);

    const top7 = topProblemResolvers.slice(0, 7);

    return top7;
  } catch (error: any) {
    throw new Error(`Failed to get top problem solvers: ${error.message}`);
  }
};


export const getProblemsDataDistributionByYearService = async (queryOption: QueryOption) => {
  try {
    const year = queryOption.year || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    let results = [];

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const total = await getProblemsDataDistributionByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }
    return result;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const getProblemsDataDistributionByMonth = async (startOfMonth: Date, endOfMonth: Date) => {
  try {
    const total = await submission.countDocuments({
      isDeleted: false,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      },
      isAccepted: true
    })
    return total;
  } catch (error: any) {
    throw new Error(error.message)
  }
}