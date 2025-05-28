import { result } from '../services/leetcode.service';
import Problem, { IProblem, ITestCase } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { QueryOption } from '../types/QueryOption.type';
import axios from 'axios';
import acorn from 'acorn';
import { RunCodeResultType } from '../types/ProblemType.type';
import user from '../models/user';
import submission from '../models/submission';
import problem from '../models/problem';
import { Types } from 'mongoose';
import { PassThrough, Readable } from 'stream';
import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { CodeActionType } from '../enums/CodeAction.enum';
import dedent from 'dedent';

const docker = new Docker();
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
  try {
    const tasks = [];
    for (let skip = 0; skip < total; skip += 1) {
      tasks.push(
        limit(async () => {
          const questions = await fetchProblems(skip);
          for (const question of questions) {
            if (question) {
              let tags: any[] = [];
              const codeEditorData = await fetchEditorData(question.titleSlug);
              if (!codeEditorData) {
                continue;
              }
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
    return await Promise.all(tasks);
  } catch (error: any) {
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

export const submissionDetail = async (submissionId: number) => {
  try {
    const submissionDoc = await submission
      .findById(submissionId)
      .populate('submitBy', '_id username avatar')
      .populate('problem', '_id title slug')
      .lean();

    if (!submissionDoc) {
      return null;
    }

    return {
      status: 200,
      data: {
        data: {
          submissionDetails: submissionDoc,
        },
      },
    };
  } catch (error) {
    console.error('Error in submissionDetail:', error);
    return null;
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
      { slug: payload.slug },
      { $set: payload },
      { upsert: true, new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const DeleteProblemService = async (_id: string) => {
  try {
    const result = await Problem.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error('No problem found with the given ID');
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete problem');
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

export const refactorCodeWithAiService = async (typedCode: string, lang: Language) => {
  const prompt = `You are an experienced software engineer and code reviewer. I will provide a code snippet in the following format:
Language: ${lang}
TypedCode:
${typedCode}
Please perform a detailed review of the provided code. Only output the parts of the code that need to be revised (if any). If the code is already of high quality, suggest alternative implementations or simply respond with "Your code meets the requirements." Do not provide any explanations or comments.`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.MODEL,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: process.env.OPENROUTER_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = response.data.choices[0].message.content;
    return result;
  } catch (error: any) {
    console.error(error.message);
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

async function ensureImageExists(image: string): Promise<void> {
  const images = await docker.listImages();
  const exists = images.some((img) => img.RepoTags?.includes(image));

  if (!exists) {
    await new Promise<void>((resolve, reject) => {
      docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished);
        function onFinished(err: Error | null) {
          if (err) return reject(err);
          resolve();
        }
      });
    });
  }
}

function extractErrorSnippet(errorOutput: string, lang: string): string | null {
  let match: RegExpMatchArray | null = null;

  // Map ngôn ngữ -> regex ưu tiên
  const langRegexMap: Record<string, RegExp[]> = {
    python: [/File "(\/src\/temp\/main\.py)", line (\d+)[\s\S]*?\n\s*\^\nSyntaxError: .*/],
    javascript: [/at .*\/src\/temp\/main\.(js|ts):\d+:\d+/],
    csharp: [/\/src\/temp\/main\.cs\((\d+),(\d+)\): error .*/],
  };

  const fallbackRegexList: RegExp[] = [/\/src\/temp\/main\.(py|js|ts|cs):?\(?\d+(,\d+)?\)?/];

  const preferredRegex = langRegexMap[lang.toLowerCase()] || [];
  const combinedRegexList = [...preferredRegex, ...fallbackRegexList];

  for (const regex of combinedRegexList) {
    match = errorOutput.match(regex);
    if (match) break;
  }

  return match ? match[0] : '';
}

async function startDocker(
  lang: string,
  typed_code: string,
): Promise<{
  shortErrorLine: string;
  errorOutput: string;
  output: string;
  memory: number;
  runTime: number;
}> {
  let image = '';
  let filename = '';
  let runCmd: string[] = [];
  if (lang === 'javascript') {
    image = 'node:18-alpine';
    filename = 'main.js';
    runCmd = ['node', `/src/temp/${filename}`];
  } else if (lang === 'typescript') {
    image = 'node:18-alpine';
    filename = 'main.ts';
    runCmd = [
      'sh',
      '-c',
      `
      yarn global add typescript && \
      yarn add @types/node && \
      tsc /src/temp/main.ts --outDir /src/temp && \
      node /src/temp/main.js \ 
      rm -f package.json yarn.lock
    `,
    ];
  } else if (lang === 'java') {
    image = 'openjdk:17-slim';
    filename = 'main.java';
    runCmd = [
      'sh',
      '-c',
      `
      javac /src/temp/main.java && \
      java -cp /src/temp main
      `,
    ];
  } else if (lang === 'cpp') {
    image = 'gcc:latest';
    filename = 'main.cpp';
    runCmd = [
      'sh',
      '-c',
      `
      g++ /src/temp/main.cpp -o /src/temp/main && \
      /src/temp/main
    `,
    ];
  } else if (lang === 'python') {
    image = 'python:3.11-alpine';
    filename = 'main.py';
    runCmd = ['python3', `/src/temp/${filename}`];
  } else {
    throw new Error(`Unsupported language: ${lang}`);
  }

  await ensureImageExists(image);

  const srcDir = path.join(process.cwd(), 'src', 'temp');
  const filePath = path.join(srcDir, filename);
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(filePath, typed_code);

  const container = await docker.createContainer({
    Image: image,
    Cmd: runCmd,
    WorkingDir: '/src',
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    Volumes: { '/src': {} },
    HostConfig: {
      Binds: [`${process.cwd()}/src:/src`],
      Memory: 1024 * 1024 * 1024,
      CpuShares: 512,
    },
  });

  const statsStream = (await container.stats({ stream: true })) as Readable;
  let peakMemory = 0;
  statsStream.on('data', (chunk) => {
    const stats = JSON.parse(chunk.toString());
    const mem = stats.memory_stats?.usage ?? 0;
    if (mem > peakMemory) {
      peakMemory = mem;
    }
  });
  const startTime = Date.now();
  await container.start();

  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true,
  });

  const stdout = new PassThrough();
  const stderr = new PassThrough();
  container.modem.demuxStream(stream, stdout, stderr);

  let output = '';
  let errorOutput = '';

  stdout.on('data', (data) => {
    output += data?.toString();
  });

  stderr.on('data', (data) => {
    errorOutput += data?.toString();
  });

  let shortErrorLine: string | null = '';
  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('⏰ Code execution timed out')), 10000),
  );

  const streamEndPromise = new Promise<void>((resolve) => {
    stream.on('end', () => {
      statsStream.destroy();
      if (errorOutput) {
        shortErrorLine = extractErrorSnippet(errorOutput, lang);
      }
      resolve();
    });
  });

  await Promise.race([streamEndPromise, timeoutPromise]);

  await container.remove({ force: true });
  const endTime = Date.now();
  const runTime = endTime - startTime;

  return { shortErrorLine, errorOutput, output, memory: peakMemory, runTime };
}

function generateRunnerCode(
  userCode: string,
  functionName: string,
  className: string,
  testCases: any[],
  lang: string,
  isCheckExcludeFunctionName: boolean,
): string {
  if (lang === 'javascript') {
    const tests = testCases
      .map(({ input, output, type, lenghtInput }, idx) => {
        // if input is an array with more than 1 element, use spread operator
        // if input is a string, parse it to JSON
        let parseInput;
        try {
          if (type === 'string') {
            parseInput = input;
            if (typeof input === 'number') {
              parseInput = JSON.stringify(input);
            }
          } else {
            parseInput = JSON.parse(input);
          }
        } catch {
          parseInput = input;
        }
        let args;
        if (isCheckExcludeFunctionName) {
          if (hasNestedArray(parseInput)) {
            if (userCode.includes('ListNode')) {
              // Convert nested arrays to ListNodes
              args = parseInput.map((arr: any) => `arrayToList(${JSON.stringify(arr)})`).join(', ');
            } else {
              args = `...${JSON.stringify(parseInput)}`;
            }
          } else {
            if (userCode.includes('ListNode') && Array.isArray(parseInput)) {
              args = `arrayToList(${JSON.stringify(parseInput)})`;
            } else {
              args = JSON.stringify(parseInput);
            }
          }
        } else {
          if (hasNestedArray(parseInput)) {
            args = `...${JSON.stringify(parseInput)}`;
          }
          if (lenghtInput > 1) {
            args = `...${JSON.stringify(parseInput)}`;
          } else {
            args = JSON.stringify(parseInput);
          }
        }
        const callExpression = className
          ? `instance.${functionName}(${args})`
          : `${functionName}(${args})`;
        return `
  try { 
    
    const result = ${callExpression};
    const expected = ${JSON.stringify(output)};
    const actual = ${isCheckExcludeFunctionName ? 'listToArray(result)' : 'result'};
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      console.log("Test ${idx + 1} passed");
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected);
    } else {
      console.log("Test ${idx + 1} failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected); 
    }
    console.log("RESULT:", JSON.stringify(actual));
  } catch (e) {
    console.log(e.stack);
  }
  `;
      })
      .join('\n');

    return `

    ${
      isCheckExcludeFunctionName
        ? `
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function listToArray(head) {
  const arr = [];
  while (head) {
    arr.push(head.val);
    head = head.next;
  }
  return arr;
}

function arrayToList(arr) {
  let dummy = new ListNode(0);
  let current = dummy;
  for (const val of arr) {
    current.next = new ListNode(val);
    current = current.next;
  }
  return dummy.next;
}
`
        : ''
    }

  ${userCode}

  const codeAnswer = [];
  const expectedCodeAnswer = [];
  
  ${className ? `const instance = new ${className}();` : ''}

  ${tests}
  
  return {
    codeAnswer,
    expectedCodeAnswer
  };
  `;
  }

  if (lang === 'typescript') {
    const tests = testCases
      .map(({ input, output, type, lenghtInput }, idx) => {
        let parseInput;
        try {
          if (type === 'string') {
            parseInput = input;
            if (typeof input === 'number') {
              parseInput = JSON.stringify(input);
            }
          } else {
            parseInput = JSON.parse(input);
          }
        } catch (e) {
          parseInput = input;
        }

        let args;
        if (isCheckExcludeFunctionName) {
          if (hasNestedArray(parseInput)) {
            if (userCode.includes('ListNode')) {
              args = parseInput.map((arr: any) => `arrayToList(${JSON.stringify(arr)})`).join(', ');
            } else {
              args = `...${JSON.stringify(parseInput)}`;
            }
          } else {
            if (userCode.includes('ListNode') && Array.isArray(parseInput)) {
              args = `arrayToList(${JSON.stringify(parseInput)})`;
            } else {
              args = JSON.stringify(parseInput);
            }
          }
        } else {
          if (hasNestedArray(parseInput)) {
            args = `...${JSON.stringify(parseInput)}`;
          }
          if (lenghtInput > 1) {
            args = `...${JSON.stringify(parseInput)}`;
          } else {
            args = JSON.stringify(parseInput);
          }
        }

        const callExpression = className
          ? `instance.${functionName}(${args})`
          : `${functionName}(${args})`;

        return `
try { 
  const result = ${callExpression};
  const expected = ${JSON.stringify(output)};
  const actual = ${isCheckExcludeFunctionName ? 'listToArray(result)' : 'result'};
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log("Test ${idx + 1} passed");
    codeAnswer.push(actual);
    expectedCodeAnswer.push(expected);
  } else {
    console.log("Test ${idx + 1} failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
    codeAnswer.push(actual);
    expectedCodeAnswer.push(expected); 
  }
  console.log("RESULT:", JSON.stringify(actual));
} catch (e:any) {
  console.log(e.stack);
}
      `;
      })
      .join('\n');

    return `
${
  isCheckExcludeFunctionName
    ? `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function listToArray(head: ListNode | null): number[] {
  const arr: number[] = [];
  while (head) {
    arr.push(head.val);
    head = head.next;
  }
  return arr;
}

function arrayToList(arr: number[]): ListNode | null {
  let dummy = new ListNode(0);
  let current = dummy;
  for (const val of arr) {
    current.next = new ListNode(val);
    current = current.next;
  }
  return dummy.next;
}
`
    : ''
}

${userCode}

const codeAnswer: any[] = [];
const expectedCodeAnswer: any[] = [];

${className ? `const instance = new ${className}();` : ''}

${tests}

  module.exports = {
    codeAnswer,
    expectedCodeAnswer
  };
  `;
  }

  if (lang === 'java') {
    const typedCode = addStaticToInnerClasses(userCode);
    const formatJavaValue = (val: any): string => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return formatJavaValue(parsed);
        } catch {
          return `"${val}"`;
        }
      }
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (val === null) return 'null';
      if (typeof val === 'number') return val.toString();

      if (Array.isArray(val)) {
        if (val.length === 0) return 'new int[]{}';
        if (Array.isArray(val[0])) {
          const innerArrays = val.map((innerArr: any[]) => {
            const formatted = formatJavaValue(innerArr);
            return formatted.startsWith('new ') ? formatted : `new int[]{${innerArr.join(',')}}`;
          });
          return `new int[][]{${innerArrays.join(',')}}`;
        }
        if (typeof val[0] === 'number') return `new int[]{${val.join(',')}}`;
        if (typeof val[0] === 'string')
          return `new String[]{${val.map((v) => `"${v}"`).join(',')}}`;
        if (typeof val[0] === 'boolean')
          return `new boolean[]{${val.map((v) => (v ? 'true' : 'false')).join(',')}}`;
      }

      return `${val}`;
    };

    const tests = testCases
      .map(({ input, output, type, lenghtInput }, idx) => {
        let parseInput;
        try {
          if (type === 'string') {
            parseInput = input;
            if (typeof input === 'number') {
              parseInput = input.toString();
            }
          } else {
            parseInput = typeof input === 'string' ? JSON.parse(input) : input;
          }
        } catch {
          parseInput = input;
        }
        const isListNode = userCode.includes('ListNode');
        let args;
        if (isListNode && Array.isArray(parseInput)) {
          if (Array.isArray(parseInput[0])) {
            args = parseInput
              .map((item) => {
                if (Array.isArray(item)) {
                  return `arrayToList(new int[]{${item.join(',')}})`;
                } else {
                  return `${item}`;
                }
              })
              .join(', ');
          } else {
            args = `arrayToList(new int[]{${parseInput.join(',')}})`;
          }
        } else {
          if (Array.isArray(parseInput) && isAllArray(parseInput)) {
            if (parseInput.every((x) => typeof x === 'number')) {
              args = `new int[]{${parseInput.map(formatJavaValue).join(', ')}}`;
            } else if (parseInput.every((x) => typeof x === 'string')) {
              args = `new String[]{${parseInput.map(formatJavaValue).join(', ')}}`;
            } else if (parseInput.every((x) => Array.isArray(x))) {
              args = parseInput
                .map((sub) => `Arrays.asList(${sub.map(formatJavaValue).join(', ')})`)
                .join(', ');
              args = `Arrays.asList(${args})`;
            } else {
              args = Array.isArray(parseInput)
                ? (parseInput as unknown[]).map(formatJavaValue).join(', ')
                : formatJavaValue(parseInput);
            }
          } else if (Array.isArray(parseInput) && type === 'array') {
            if (parseInput.every((x) => typeof x === 'number')) {
              args = `new int[]{${parseInput.map(formatJavaValue).join(', ')}}`;
            } else if (parseInput.every((x) => typeof x === 'string')) {
              args = `new String[]{${parseInput.map(formatJavaValue).join(', ')}}`;
            } else if (parseInput.every((x) => Array.isArray(x))) {
              args = parseInput
                .map((sub) => `Arrays.asList(${sub.map(formatJavaValue).join(', ')})`)
                .join(', ');
              args = `Arrays.asList(${args})`;
            } else {
              args = Array.isArray(parseInput)
                ? (parseInput as unknown[]).map(formatJavaValue).join(', ')
                : formatJavaValue(parseInput);
            }
          } else if (Array.isArray(parseInput) && !isAllArray(parseInput)) {
            args = parseInput
              .map((item) => {
                if (Array.isArray(item)) {
                  if (item.every((x) => typeof x === 'number')) {
                    return `new int[]{${item.map(formatJavaValue).join(', ')}}`;
                  }
                  if (item.every((x) => typeof x === 'string')) {
                    return `new String[]{${item.map(formatJavaValue).join(', ')}}`;
                  }
                  return `Arrays.asList(${item.map(formatJavaValue).join(', ')})`;
                } else if (typeof item === 'string') {
                  return `"${item}"`;
                } else {
                  return formatJavaValue(item);
                }
              })
              .join(', ');
          } else if (type === 'string' && input !== '' && input !== '' && input !== ``) {
            args = JSON.stringify(parseInput);
          } else {
            args = formatJavaValue(parseInput);
          }
        }
        const callExpression = className
          ? `${className} instance = new ${className}();\n        Object result = instance.${functionName}(${args});`
          : `Object result = ${functionName}(${args});`;

        const expected = formatJavaValue(output);
        const isStringArrayExpected = expected.includes('new String[]');
        const resultFormat = isListNode ? 'listToArray((ListNode)result)' : 'result';

        return `
        try {
            ${callExpression}
            Object expected = ${expected};
            
            String resultStr;
if (result == null) {
    resultStr = "[]";
} else if (result instanceof List) {
    List<?> list = (List<?>) result;
        String[] arr = list.stream()
                           .map(e -> e == null ? "null" : e.toString())
                           .toArray(String[]::new);
        resultStr = ${isStringArrayExpected ? 'toQuotedStringArray(arr);' : 'Arrays.toString(arr);'};
} else if (result instanceof int[]) {
    resultStr = Arrays.toString((int[]) result);
} else if (result instanceof double[]) {
    resultStr = Arrays.toString((double[]) result);
} else if (result instanceof boolean[]) {
    resultStr = Arrays.toString((boolean[]) result);
} else if (result instanceof Object[]) {
    resultStr = Arrays.deepToString((Object[]) result);
}
${
  isListNode
    ? `
else if (result instanceof ListNode) {
    List<Integer> arr = listToArray((ListNode) result);
    resultStr = arr.toString();
}`
    : ''
}
else {
    resultStr = result.toString();
}


String expectedStr;

if (expected == null) {
    expectedStr = "[]";
} else if (expected instanceof int[]) {
    expectedStr = Arrays.toString((int[]) expected);
} else if (expected instanceof long[]) {
    expectedStr = Arrays.toString((long[]) expected);
} else if (expected instanceof double[]) {
    expectedStr = Arrays.toString((double[]) expected);
} else if (expected instanceof boolean[]) {
    expectedStr = Arrays.toString((boolean[]) expected);
} else if (expected instanceof String[]) {
    expectedStr = toQuotedStringArray((String[]) expected);
} else if (expected instanceof Object[]) {
    expectedStr = Arrays.deepToString((Object[]) expected);
} else {
    expectedStr = expected.toString();
}


            if (resultStr.replaceAll("\\\\s+", "").equals(expectedStr.replaceAll("\\\\s+", ""))) {
                System.out.println("Test ${idx + 1} passed");
                codeAnswer.add(resultStr);
                expectedCodeAnswer.add(expectedStr);
            } else {
                System.out.println("Test ${idx + 1} failed: expected " + expectedStr + ", got " + resultStr);
                codeAnswer.add(resultStr);
                expectedCodeAnswer.add(expectedStr);
            }
            System.out.println("RESULT: " + resultStr);
        } catch (Exception e) {
            System.out.println("Test ${idx + 1} failed due to exception:");
            e.printStackTrace();
        }`;
      })
      .join('\n');

    return `
import java.util.*;

class main {
    public static List<String> codeAnswer = new ArrayList<>();
    public static List<String> expectedCodeAnswer = new ArrayList<>();

    public static void main(String[] args) {
        ${tests}
    }
        public static String toQuotedStringArray(Object[] arr) {
    if (arr == null) return "null";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < arr.length; i++) {
        sb.append("\\\"").append(arr[i]).append("\\\"");
        if (i < arr.length - 1) sb.append(",");  // Bỏ dấu cách sau dấu phẩy
    }
    sb.append("]");
    return sb.toString();
}


    ${
      typedCode.includes('ListNode')
        ? `
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode arrayToList(int[] arr) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int num : arr) {
            curr.next = new ListNode(num);
            curr = curr.next;
        }
        return dummy.next;
    }

    public static List<Integer> listToArray(ListNode head) {
        List<Integer> res = new ArrayList<>();
        while (head != null) {
            res.add(head.val);
            head = head.next;
        }
        return res;
    }
    `
        : ''
    }

    // --- USER CODE ---
    ${typedCode}
}
`;
  }

  if (lang === 'python') {
    const tests = testCases
      .map(({ input, output, type, lenghtInput }, idx) => {
        let parseInput;
        try {
          if (type === 'string') {
            parseInput = input;
            if (typeof input === 'number') {
              parseInput = JSON.stringify(input);
            }
          } else {
            parseInput = JSON.parse(input);
          }
        } catch {
          parseInput = input;
        }

        let args;
        if (isCheckExcludeFunctionName) {
          if (hasNestedArray(parseInput)) {
            if (userCode.includes('ListNode')) {
              args = parseInput
                .map((arr: any) => `array_to_list(${JSON.stringify(arr)})`)
                .join(', ');
            } else {
              args = JSON.stringify(parseInput);
            }
          } else {
            if (userCode.includes('ListNode') && Array.isArray(parseInput)) {
              args = `array_to_list(${JSON.stringify(parseInput)})`;
            } else {
              args = JSON.stringify(parseInput);
            }
          }
        } else {
          if (hasNestedArray(parseInput) || lenghtInput > 1) {
            args = parseInput.map((x: any) => JSON.stringify(x)).join(', ');
          } else {
            args = JSON.stringify(parseInput);
          }
        }

        const callExpression = className
          ? `instance.${functionName}(${args})`
          : `${functionName}(${args})`;

        return `
try:
    result = ${callExpression}
    expected = ${typeof output === 'boolean' ? convertToPythonBoolean(output) : JSON.stringify(output)}
    actual = ${isCheckExcludeFunctionName ? 'list_to_array(result)' : 'result'}
    if actual == expected:
        print("Test ${idx + 1} passed")
        code_answer.append(actual)
        expected_code_answer.append(expected)
    else:
        print(f"Test ${idx + 1} failed: expected {expected}, got {actual}")
        code_answer.append(actual)
        expected_code_answer.append(expected)
    print(f"RESULT: {actual}")
except Exception as e:
    print(str(e))
`;
      })
      .join('\n');

    return `
  ${
    isCheckExcludeFunctionName
      ? `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def list_to_array(head):
    arr = []
    current = head
    while current:
        arr.append(current.val)
        current = current.next
    return arr

def array_to_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head
  `
      : ''
  }
  
${userCode}
  
code_answer = []
expected_code_answer = []
  
  ${className ? `instance = ${className}()` : ''}
  
  ${tests}
  
  # Return results
result = {
    "code_answer": code_answer,
    "expected_code_answer": expected_code_answer
}
  `;
  }

  // if (lang === 'cpp') {
  //   const formatCppValue = (val: any): string => {
  //     if (typeof val === 'string') {
  //       try {
  //         val = JSON.parse(val);
  //       } catch {
  //         return val;
  //       }
  //     }

  //     if (typeof val === 'boolean') {
  //       return val ? 'true' : 'false';
  //     }

  //     if (Array.isArray(val)) {
  //       if (val.length === 0) return 'std::vector<int>{}';
  //       if (Array.isArray(val[0])) {
  //         const inner = val.map(formatCppValue).join(', ');
  //         return `std::vector<std::vector<int>>{{${inner}}}`;
  //       }
  //       const inner = val.join(', ');
  //       return `std::vector<int>{${inner}}`;
  //     }
  //     return `${val}`;
  //   };

  //   const tests = testCases
  //     .map(({ input, output }, idx) => {
  //       const nums = input[0];
  //       const target = input[1];
  //       const numsStr = formatCppValue(nums);
  //       const expectedStr = formatCppValue(output);

  //       // const callExpr = className
  //       // ? `sol.${functionName}(${numsStr}, ${target})`
  //       // : `${functionName}(${numsStr}, ${target})`;

  //       return `
  //     try {
  //       ${className ? `${className} sol;` : ''}
  //       // Solution sol;
  //       std::vector<int> nums = ${numsStr};
  //       auto result = sol.${functionName}(nums, ${target});
  //       auto expected = ${expectedStr};
  //       results.push_back(result);
  //       expecteds.push_back(expected);

  //       if (result == expected) {
  //         std::cout << "✅ Test ${idx + 1} passed" << std::endl;
  //       } else {
  //         std::cout << "❌ Test ${idx + 1} failed: expected ";
  //         printValue(expected);
  //         std::cout << ", got ";
  //         printValue(result);
  //         std::cout << std::endl;
  //       }
  //       std::cout << "RESULT: ";
  //       printValue(result);
  //       std::cout << std::endl;
  //     } catch (const std::exception& e) {
  //       std::cout << "❗ Error in test ${idx + 1}: " << e.what() << std::endl;
  //     }`;
  //     })
  //     .join('\n');

  //   return `
  //   #include <vector>
  //   #include <iostream>
  //   #include <string>
  //   #include <sstream>
  //   using namespace std;

  //   ${userCode}

  //   template <typename T>
  //   void printValue(const T& value) {
  //       std::cout << value;
  //   }

  //   template <typename T>
  //   void printValue(const std::vector<T>& vec) {
  //       std::cout << "[";
  //       for (size_t i = 0; i < vec.size(); ++i) {
  //           printValue(vec[i]);
  //           if (i != vec.size() - 1) std::cout << ",";
  //       }
  //       std::cout << "]";
  //   }

  //   template <typename T>
  //   void printValue(const std::vector<std::vector<T>>& vec) {
  //       std::cout << "[";
  //       for (size_t i = 0; i < vec.size(); ++i) {
  //           printValue(vec[i]);
  //           if (i != vec.size() - 1) std::cout << ",";
  //       }
  //       std::cout << "]";
  //   }

  //   std::string vectorToJson(const std::vector<int>& vec) {
  //       std::ostringstream oss;
  //       oss << "[";
  //       for (size_t i = 0; i < vec.size(); ++i) {
  //           oss << vec[i];
  //           if (i != vec.size() - 1) oss << ",";
  //       }
  //       oss << "]";
  //       return oss.str();
  //   }

  //   std::string vectorsToJson(const std::vector<std::vector<int>>& vecs) {
  //       std::ostringstream oss;
  //       oss << "[";
  //       for (size_t i = 0; i < vecs.size(); ++i) {
  //           oss << vectorToJson(vecs[i]);
  //           if (i != vecs.size() - 1) oss << ",";
  //       }
  //       oss << "]";
  //       return oss.str();
  //   }

  //   int main() {
  //       std::vector<std::vector<int>> results;
  //       std::vector<std::vector<int>> expecteds;

  //       ${tests}

  //       std::cout << "Results: " << vectorsToJson(results) << std::endl;
  //       std::cout << "Expecteds: " << vectorsToJson(expecteds) << std::endl;

  //       return 0;
  //   }
  //   `;
  // }

  interface TestCase {
    input: any;
    output: any;
    type?: string;
    lenghtInput: number;
  }

  if (lang === 'cpp') {
    const formatCppValue = (val: string, isListNode: boolean): string => {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'boolean') {
          return parsed ? 'true' : 'false';
        }
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            return isListNode ? 'nullptr' : 'std::vector<int>{}';
          }
          if (Array.isArray(parsed[0])) {
            const inner = parsed
              .map((v: any) => formatCppValue(JSON.stringify(v), isListNode))
              .join(', ');
            return isListNode
              ? parsed.map((v: any) => `arrayToList(${JSON.stringify(v)})`).join(', ')
              : `std::vector<std::vector<int>>{${inner}}`;
          }
          const inner = parsed.join(', ');
          return isListNode
            ? `arrayToList(${JSON.stringify(parsed)})`
            : `std::vector<int>{${inner}}`;
        }
        if (typeof parsed === 'string') {
          return `"${parsed}"`;
        }
        return `${parsed}`; // Number
      } catch {
        return val[0] === '"' && val[val.length - 1] === '"' ? val : `"${val}"`;
      }
    };

    const hasNestedArray = (input: any): boolean => {
      try {
        const parsed = Array.isArray(input) ? input : JSON.parse(input);
        return Array.isArray(parsed) && parsed.some(Array.isArray);
      } catch {
        return false;
      }
    };

    const getResultType = (output: any, isListNode: boolean): string => {
      if (isListNode) return 'std::vector<int>';
      if (Array.isArray(output)) {
        return output.length > 0 && Array.isArray(output[0])
          ? 'std::vector<std::vector<int>>'
          : 'std::vector<int>';
      }
      if (typeof output === 'boolean') return 'bool';
      if (typeof output === 'number') return 'int';
      if (typeof output === 'string') return 'std::string';
      return 'auto';
    };

    const firstOutput = testCases.length > 0 ? testCases[0].output : null;
    const resultType = getResultType(firstOutput, isCheckExcludeFunctionName);

    const tests = testCases
      .map(({ input, output, type, lenghtInput }: TestCase, idx: number) => {
        const isListNode = isCheckExcludeFunctionName && userCode.includes('ListNode');

        let args: string;
        if (lenghtInput > 1 || hasNestedArray(input)) {
          const inputs = Array.isArray(input) ? input : JSON.parse(input);
          args = inputs.map((v: any) => formatCppValue(JSON.stringify(v), isListNode)).join(', ');
        } else {
          args =
            type === 'string' && typeof input !== 'number'
              ? `"${input}"`
              : formatCppValue(JSON.stringify(input), isListNode);
        }

        const expected = formatCppValue(JSON.stringify(output), isListNode);

        const callExpression = className
          ? `instance.${functionName}(${args})`
          : `${functionName}(${args})`;

        const resultCompare = isCheckExcludeFunctionName
          ? 'compareVectors(actual, expected)'
          : 'actual == expected';

        const expectedPrint = isCheckExcludeFunctionName
          ? 'vectorToString(expected)'
          : 'toString(expected)';

        const actualPrint = isCheckExcludeFunctionName
          ? 'vectorToString(actual)'
          : 'toString(actual)';

        const resultValue = isCheckExcludeFunctionName ? 'listToArray(result)' : 'result';

        return `
      try {
        auto result = ${callExpression};
        auto expected = ${expected};
        auto actual = ${resultValue};
        if (${resultCompare}) {
          cout << "Test ${idx + 1} passed" << endl;
          codeAnswer.push_back(actual);
          expectedCodeAnswer.push_back(expected);
        } else {
          cout << "Test ${idx + 1} failed: expected " << ${expectedPrint} << ", got " << ${actualPrint} << endl;
          codeAnswer.push_back(actual);
          expectedCodeAnswer.push_back(expected);
        }
        cout << "RESULT: " << ${actualPrint} << endl;
      } catch (const std::exception& e) {
        cout << "Error: " << e.what() << endl;
      }
      `;
      })
      .join('\n');

    return `
  #include <iostream>
  #include <vector>
  #include <string>
  using namespace std;
  
  ${
    isCheckExcludeFunctionName
      ? `
  struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x = 0, ListNode* n = nullptr) : val(x), next(n) {}
  };
  
  vector<int> listToArray(ListNode* head) {
    vector<int> arr;
    while (head) {
      arr.push_back(head->val);
      head = head->next;
    }
    return arr;
  }
  
  ListNode* arrayToList(vector<int> arr) {
    ListNode dummy(0);
    ListNode* current = &dummy;
    for (int val : arr) {
      current->next = new ListNode(val);
      current = current->next;
    }
    return dummy.next;
  }
  
  string vectorToString(const vector<int>& vec) {
    string result = "{";
    for (size_t i = 0; i < vec.size(); ++i) {
      result += to_string(vec[i]);
      if (i < vec.size() - 1) result += ", ";
    }
    result += "}";
    return result;
  }
  
  bool compareVectors(const vector<int>& v1, const vector<int>& v2) {
    if (v1.size() != v2.size()) return false;
    for (size_t i = 0; i < v1.size(); ++i) {
      if (v1[i] != v2[i]) return false;
    }
    return true;
  }
  `
      : ''
  }
  
  // Fallback toString for scalar types
  template<typename T>
  string toString(const T& val) {
    return to_string(val);
  }
  
  // Specialization for string
  string toString(const string& val) {
    return '"' + val + '"';
  }
  
  // Specialization for vector<int>
  string toString(const vector<int>& vec) {
    string result = "{";
    for (size_t i = 0; i < vec.size(); ++i) {
      result += to_string(vec[i]);
      if (i < vec.size() - 1) result += ", ";
    }
    result += "}";
    return result;
  }
  
  // Specialization for vector<vector<int>>
  string toString(const vector<vector<int>>& mat) {
    string result = "{";
    for (size_t i = 0; i < mat.size(); ++i) {
      result += toString(mat[i]);
      if (i < mat.size() - 1) result += ", ";
    }
    result += "}";
    return result;
  }
  
  ${userCode}
  
  int main() {
    vector<${resultType}> codeAnswer;
    vector<${resultType}> expectedCodeAnswer;
  
    ${className ? `${className} instance;` : ''}
  
    ${tests}
  
    return 0;
  }
  `;
  }

  return `# Unsupported language: ${lang}`;
}

function extractResultsFromOutput(output: string[]) {
  return output
    .filter((line) => line.startsWith('RESULT:'))
    .map((line) => line.replace('RESULT:', '').trim());
}

function convertToPythonBoolean(val: boolean) {
  if (val === true) return 'True';
  if (val === false) return 'False';
  return JSON.stringify(val); // fallback cho các kiểu khác (string, number, array, etc.)
}

type ParsedTestCase = {
  input: [number[], number];
  output: any;
  type: string;
  lenghtInput: number;
};

/**
 * Parses test cases from the database.
 * @param testCases - The test cases to parse.
 * @param isHidden - Whether to include hidden test cases.
 * @returns An array of parsed test cases.
 * Get input and output from test case
 */
function parseTestCases(testCases: ITestCase[], isHidden: boolean): ParsedTestCase[] {
  return testCases
    .filter((test) => isHidden || !test.isHidden)
    .map((test) => {
      const inputs = test.input.map((i) => (i as any).toObject());
      const parsedInputs = inputs.map((i) => {
        const value = i.value;
        try {
          return JSON.parse(value);
        } catch {
          if (i.type === 'string' && !value) {
            return '';
          }
          if (!isNaN(Number(value))) return Number(value);
          if (value === 'true') return true;
          if (value === 'false') return false;
          return value;
        }
      });

      const outputStr = test.output;
      let parsedOutput: any;
      try {
        parsedOutput = JSON.parse(outputStr);
      } catch {
        if (!isNaN(Number(outputStr))) parsedOutput = Number(outputStr);
        else if (outputStr === 'true') parsedOutput = true;
        else if (outputStr === 'false') parsedOutput = false;
        else parsedOutput = outputStr;
      }

      return {
        input: parsedInputs.length === 1 ? parsedInputs[0] : parsedInputs,
        output: parsedOutput,
        type: inputs.length ? inputs[0].type : undefined,
        lenghtInput: test.input.length,
      };
    });
}

type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'c';

export function extractClassName(userCode: string, lang: Language): string | null {
  const patterns: Record<Language, RegExp[]> = {
    javascript: [/class\s+([a-zA-Z_$][\w$]*)\s*/],
    typescript: [/class\s+([a-zA-Z_$][\w$]*)\s*/],
    python: [/class\s+([a-zA-Z_][\w]*)\s*(\(|:)/],
    java: [/class\s+([A-Z][\w]*)\s*/],
    csharp: [/class\s+([A-Z][\w]*)\s*/],
    cpp: [/class\s+([A-Z][\w]*)\s*/, /struct\s+([A-Z][\w]*)\s*/],
    c: [/struct\s+([A-Z][\w]*)\s*/],
  };

  if (!patterns[lang]) return null;

  for (const pattern of patterns[lang]) {
    const match = userCode.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function getTopLevelFunctions(code: string) {
  const ast = acorn.parse(code, { ecmaVersion: 2023, sourceType: 'module' });
  const funcs = [];

  function extractFromVariableDeclaration(node: any) {
    for (const decl of node.declarations) {
      if (
        decl.init &&
        (decl.init.type === 'FunctionExpression' || decl.init.type === 'ArrowFunctionExpression')
      ) {
        if (decl.id.type === 'Identifier') {
          funcs.push(decl.id.name);
        }
      }
    }
  }

  for (const node of ast.body) {
    switch (node.type) {
      case 'FunctionDeclaration':
        if (node.id && node.id.name) funcs.push(node.id.name);
        break;

      case 'VariableDeclaration':
        extractFromVariableDeclaration(node);
        break;

      case 'ExportNamedDeclaration':
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            funcs.push(node.declaration.id.name);
          } else if (node.declaration.type === 'VariableDeclaration') {
            extractFromVariableDeclaration(node.declaration);
          }
        }
        break;

      case 'ExportDefaultDeclaration':
        if (
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id &&
          node.declaration.id.name
        ) {
          funcs.push(node.declaration.id.name);
        }
        break;

      default:
        // ignore other types
        break;
    }
  }

  return [...new Set(funcs)]; // loại trùng
}

export function extractFunctionNames(
  userCode: string,
  lang: Language,
  excludeNames: string[] = [],
): { functionNames: string[]; isCheckExcludeFunctionName: boolean } {
  const patterns: Record<Language, RegExp[]> = {
    javascript: [
      /var\s+([a-zA-Z_$][\w$]*)\s*=\s*function/g,
      /function\s+([a-zA-Z_$][\w$]*)\s*\(/g,
      /const\s+([a-zA-Z_$][\w$]*)\s*=\s*function/g,
      /let\s+([a-zA-Z_$][\w$]*)\s*=\s*function/g,
      /const\s+([a-zA-Z_$][\w$]*)\s*=\s*\(?.*?\)?\s*=>/g,
      /let\s+([a-zA-Z_$][\w$]*)\s*=\s*\(?.*?\)?\s*=>/g,
      /var\s+([a-zA-Z_$][\w$]*)\s*=\s*\(?.*?\)?\s*=>/g,
      /([a-zA-Z_$][\w$]*)\s*:\s*function\s*\(/g,
      /([a-zA-Z_$][\w$]*)\s*:\s*\(?.*?\)?\s*=>/g,
    ],
    typescript: [
      /function\s+([a-zA-Z_$][\w$]*)\s*\(/g,
      /const\s+([a-zA-Z_$][\w$]*)\s*=\s*function\s*\(/g,
      /const\s+([a-zA-Z_$][\w$]*)\s*=\s*\(.*?\)\s*=>/g,
      /const\s+([a-zA-Z_$][\w$]*)\s*=\s*async\s*\(.*?\)\s*=>/g,
      /export\s+function\s+([a-zA-Z_$][\w$]*)\s*\(/g,
      /export\s+default\s+function\s+([a-zA-Z_$][\w$]*)?\s*\(/g,
    ],
    python: [/def\s+([a-zA-Z_][\w]*)\s*\(/g],
    java: [/(?:public|private|protected)?\s*(?:static)?\s*[\w<>\[\]]+\s+([a-zA-Z_][\w]*)\s*\(/g],
    csharp: [/(?:public|private|protected)?\s*(?:static)?\s*[\w<>]+\s+([a-zA-Z_][\w]*)\s*\(/g],
    cpp: [/(?:^[\w\s:*&<>]+)?\s+([a-zA-Z_][\w]*)\s*\([^)]*\)\s*(?:const)?\s*(?:\{|;)/gm],
    c: [/(?:[\w\s*]+)\s+([a-zA-Z_][\w]*)\s*\(/g],
  };

  const langKey = lang.toLowerCase() as Language;
  const langPatterns = patterns[langKey];
  if (!langPatterns) return { functionNames: [], isCheckExcludeFunctionName: false };

  const functionNames: string[] = [];

  for (const regex of langPatterns) {
    let match;
    while ((match = regex.exec(userCode)) !== null) {
      const name = match[1];
      if (name && !excludeNames.includes(name)) {
        functionNames.push(name);
      }
    }
  }

  const isCheckExcludeFunctionName = /(?:^|\s)ListNode(?:\s|[\(\{;=])/m.test(userCode);

  return {
    functionNames: [...new Set(functionNames)],
    isCheckExcludeFunctionName,
  };
}

export const runOrSubmitCodeService = async (
  userId: string,
  lang: string,
  typed_code: string,
  titleSlug: string,
  codeActionType: CodeActionType,
) => {
  try {
    const problem = await Problem.findOne({ slug: titleSlug });
    let testInDb = problem?.testCase;
    if (!testInDb) return;
    // isHidden false -> get test case with isHidden = false
    // parse test case -> get input and output
    const testResult = parseTestCases(
      testInDb,
      codeActionType === CodeActionType.RUNCODE ? false : true,
    );

    if (!testResult) return;
    const testCases = testResult.map((tc) => ({
      input: tc.input,
      output: tc.output,
      type: tc.type,
      lenghtInput: tc.lenghtInput,
    }));

    // get function name from typed code
    let functionName = [''];
    if (lang === 'javascript') functionName = getTopLevelFunctions(typed_code);
    const problemFunctionName: { functionNames: string[]; isCheckExcludeFunctionName: boolean } =
      extractFunctionNames(typed_code, lang.toLowerCase() as Language, ['ListNode']);
    const problemClassName = extractClassName(typed_code, lang.toLowerCase() as Language);

    const isExcludeNames = problemFunctionName.isCheckExcludeFunctionName;
    const runnerCode = generateRunnerCode(
      typed_code,
      functionName[0] ? functionName[0] : problemFunctionName.functionNames[0],
      problemClassName as string,
      testCases,
      lang,
      isExcludeNames,
    );

    // run code -> use docker from docker hub -> start -> create image -> run
    const { shortErrorLine, errorOutput, output, runTime } = await startDocker(lang, runnerCode);

    let match = extractErrorSnippet(output, lang);
    const memoryUsed = process.memoryUsage().rss;

    if (errorOutput || shortErrorLine) {
      match = errorOutput ? errorOutput : shortErrorLine;
    }

    if (match) {
      if (match) {
        const runCodeError: RunCodeResultType = {
          status_code: 20,
          lang,
          run_success: false,
          compile_error: `${shortErrorLine}` || 'Unknown error',
          full_compile_error: errorOutput ? errorOutput : output,
          status_runtime: `loading`,
          memory: memoryUsed,
          code_answer: [],
          code_output: [],
          std_output_list: [''],
          total_correct: 0,
          total_testcases: testCases.length,
          status_memory: 'N/A',
          status_msg: 'Compile Error',
          state: 'SUCCESS',
        };
        return runCodeError;
      }
    }
    // success
    const total = testCases.length;
    let cleanedOutput = output.replace(/!/g, '');
    let outputArray = cleanedOutput.split('\n');

    for (let i = 0; i < outputArray.length; i++) {
      outputArray[i] = outputArray[i].replace(/[\x00-\x1F\x7F]+/g, '');
    }
    const results = extractResultsFromOutput(outputArray);
    // code answer
    const actualResults = outputArray
      .filter((line) => line.startsWith('RESULT:'))
      .map((line) => line.split('RESULT:')[1].trim());

    let correctCount = 0;
    const expectedResults = testCases.map((t) => t.output);
    const isValidJSONArray = (() => {
      try {
        if (Array.isArray(testCases[0].output)) return true;
        const parsed = JSON.parse(testCases[0].output);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    })();

    const testCasePass = parseTestOutput(output);
    for (let i = 0; i < testCasePass.length; i++) {
      const test = testCasePass[i];
      if (test.status === 'passed') {
        correctCount++;
      }
    }
    const expectedResultWithJava: string[] =
      (lang === 'java' || lang === 'python') && isValidJSONArray
        ? testCases.map((t) => {
            try {
              const arr = Array.isArray(t.output) ? t.output : JSON.parse(t.output);
              const isStringArray =
                Array.isArray(arr) && arr.every((item) => typeof item === 'string');

              if (isStringArray) {
                return JSON.stringify(arr).replace(/,/g, ', ');
              } else if (Array.isArray(arr)) {
                return JSON.stringify(arr);
              } else {
                return JSON.stringify(t.output);
              }
            } catch {
              return JSON.stringify(t.output);
            }
          })
        : testCases.map((t) => JSON.stringify(t.output));

    // run success -> seave typecode

    if (problem) {
      const codeBlock = problem.initialCode.find((code) => code.langSlug === lang);
      if (codeBlock) {
        codeBlock.code = typed_code;
        await problem.save();
      }
    }

    if (problem) {
      if (!Array.isArray(problem.initialCode)) {
        console.error('initialCode is not an array or is missing');
        return;
      }

      const codeBlock = problem.initialCode.find((code) => code.langSlug === lang);
      if (!codeBlock) {
        console.error('No code block found for lang:', lang);
        return;
      }

      problem.submitBy = [new Types.ObjectId(userId)];
      codeBlock.code = typed_code === undefined ? '' : typed_code;

      try {
        await problem.save();
        console.log('Problem saved successfully');
      } catch (e) {
        console.error('Error saving problem:', e);
      }
    } else {
      console.error('Problem not found');
    }

    const runCodeResult: RunCodeResultType = {
      status_code: results.length === total ? 15 : 20,
      lang,
      run_success: true,
      status_runtime: `${runTime} ms`,
      memory: memoryUsed,
      display_runtime: `${runTime} ms`,
      code_answer:
        correctCount === total
          ? lang === 'java' || lang === 'python'
            ? expectedResultWithJava
            : results
          : results,
      code_output:
        correctCount === total
          ? lang === 'java' || lang === 'python'
            ? expectedResultWithJava
            : results
          : results,
      std_output_list: [''],
      expected_code_answer:
        lang === 'java' || lang === 'python'
          ? expectedResultWithJava
          : testCases.map((t) => JSON.stringify(t.output)),
      expected_code_output: [],
      expected_std_output_list: [],
      correct_answer: correctCount === total,
      compare_result: `${correctCount}/${total}`,
      total_correct: correctCount,
      total_testcases: total,
      status_memory: 'N/A',
      // submission_id: new mongoose.Types.ObjectId().toString(),
      status_msg: correctCount === total ? 'Accepted' : 'Wrong Answer',
      state: 'SUCCESS',
    };

    return runCodeResult;
  } catch (error: any) {
    throw new Error(`Run or submit code failed: ${error.stack}`);
  }
};

const normalize = (value: any): string => {
  if (typeof value !== 'string') {
    return JSON.stringify(value);
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  return value;
};

function hasNestedArray(arr: any[]): boolean {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.some((item) => Array.isArray(item));
}

export function extractClassesWithStatic(userCode: string): { name: string; isStatic: boolean }[] {
  const classRegex = /(public\s+)?(static\s+)?class\s+([A-Z][\w]*)\s*/g;
  const classes: { name: string; isStatic: boolean }[] = [];
  let match;

  while ((match = classRegex.exec(userCode)) !== null) {
    const isStatic = !!match[2]; // group 2 là 'static ' nếu có
    const className = match[3];
    classes.push({ name: className, isStatic });
  }

  return classes;
}

type TestResult = {
  testNumber: number;
  status: 'passed' | 'failed';
  expected?: string;
  got?: string;
};

function parseTestOutput(output: string): TestResult[] {
  const lines = output.split('\n');
  const results: TestResult[] = [];

  const passRegex = /^Test (\d+) passed/;
  const failRegex = /^Test (\d+) failed: expected (.*), got (.*)/;

  for (const line of lines) {
    const passMatch = passRegex.exec(line);
    const failMatch = failRegex.exec(line);

    if (passMatch) {
      results.push({
        testNumber: Number(passMatch[1]),
        status: 'passed',
      });
    } else if (failMatch) {
      results.push({
        testNumber: Number(failMatch[1]),
        status: 'failed',
        expected: failMatch[2].trim(),
        got: failMatch[3].trim(),
      });
    }
  }

  return results;
}

function addStaticToInnerClasses(userCode: string): string {
  const classes = extractClassesWithStatic(userCode);

  for (const cls of classes) {
    if (!cls.isStatic) {
      // Tìm vị trí class trong chuỗi để chèn 'static'
      const classPattern = new RegExp(`(public\\s+)?class\\s+${cls.name}\\s*`);
      userCode = userCode.replace(classPattern, (match) => {
        if (match.includes('static')) return match; // đã có static rồi
        return match.replace('class', 'static class');
      });
    }
  }
  return userCode;
}

function isAllArray(parseInput: any[]) {
  return Array.isArray(parseInput) && parseInput.every(Array.isArray);
}

export const compileCodeService = async (lang: string, typed_code: string) => {
  try {
    // Check if Docker is running
    try {
      await docker.ping();
    } catch (error) {
      throw new Error('Docker is not running. Please start Docker and try again.');
    }

    // Generate a simple runner code that just executes the user's code
    let runnerCode = '';

    if (lang === 'javascript') {
      runnerCode = `
${typed_code}

// Add console.log to capture output
const originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  process.stdout.write(args.join(' ') + '\\n');
};
      `;
    } else if (lang === 'typescript') {
      runnerCode = `
${typed_code}

// Add console.log to capture output
const originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  process.stdout.write(args.join(' ') + '\\n');
};
      `;
    } else if (lang === 'python' || lang === 'python3') {
      runnerCode = typed_code;
    } else if (lang === 'java') {
      runnerCode = `
   ${typed_code}
      `;
    } else if (lang === 'cpp') {
      runnerCode = `
${typed_code}

      `;
    }

    // Run the code using Docker
    const { shortErrorLine, errorOutput, output, runTime } = await startDocker(lang, runnerCode);
    const memoryUsed = process.memoryUsage().rss;

    // Handle compilation errors
    if (errorOutput || shortErrorLine) {
      return {
        status_code: 20,
        lang,
        run_success: false,
        compile_error: shortErrorLine || 'Unknown error',
        full_compile_error: errorOutput || output,
        status_runtime: 'loading',
        memory: memoryUsed,
        code_output: [],
        std_output_list: [''],
        status_memory: 'N/A',
        status_msg: 'Compile Error',
        state: 'SUCCESS',
      };
    }

    // Success case
    return {
      status_code: 15,
      lang,
      run_success: true,
      status_runtime: `${runTime} ms`,
      memory: memoryUsed,
      display_runtime: `${runTime} ms`,
      code_output: output.split('\n').filter((line) => line.trim()),
      std_output_list: output.split('\n').filter((line) => line.trim()),
      status_memory: 'N/A',
      status_msg: 'Success',
      state: 'SUCCESS',
    };
  } catch (error: any) {
    // Handle specific Docker-related errors
    if (error.message.includes('docker_engine')) {
      throw new Error('Docker is not running. Please start Docker and try again.');
    } else if (error.message.includes('ENOENT')) {
      throw new Error(
        'Docker is not installed or not properly configured. Please install Docker and try again.',
      );
    }
    throw new Error(`Compile code failed: ${error.message}`);
  }
};
