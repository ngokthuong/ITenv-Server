import { result } from '../services/leetcode.service';
import Problem, { IProblem } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { QueryOption } from '../types/QueryOption.type';

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
                exampleTestcases: question.exampleTestcases,
                tags: tags,
                initialCode: codeEditorData,
              });
            }
          }
        }
      }),
    );
  }
  await Promise.all(tasks);
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
};
