import { result } from '../services/leetcode.service';
import Problem, { IProblem, ITestCase } from '../models/problem';
import Tag from '../models/tag';
import pLimit from 'p-limit';
import { EnumTag } from '../enums/schemaTag.enum';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';
import { QueryOption } from '../types/QueryOption.type';
import axios from 'axios';
import {
  runCodeErrorType,
  RunCodeResultSuccessType,
  SubmissionBody,
} from '../types/ProblemType.type';
import user from '../models/user';
import submission from '../models/submission';
import problem from '../models/problem';
import mongoose from 'mongoose';
import { PassThrough, Readable } from 'stream';
import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { CodeActionType } from '../enums/CodeAction.enum';

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

export const runCode = async (
  name: string,
  submissionBody: SubmissionBody & { data_input: string },
) => {
  try {
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
    throw error;
  }
};

export const submit = async (name: string, submissionBody: SubmissionBody) => {
  try {
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
    throw error;
  }
};

export const checkSubmissionStatus = async (submissionId: string, titleSlug: string) => {
  try {
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

function extractErrorSnippet(errorOutput: string, lang: string): string {
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

  return match ? match[0] : null;
}

async function startDocker(
  lang: string,
  typed_code: string,
): Promise<{ shortErrorLine: string; errorOutput: string; output: string; memory: number }> {
  let image = '';
  let filename = '';
  let runCmd: string[] = [];

  if (lang === 'javascript') {
    image = 'node:18-alpine';
    filename = 'main.js';
    runCmd = ['node', `/src/temp/${filename}`];
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
    output += data.toString();
  });

  stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  let shortErrorLine: string | null = '';
  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('⏰ Code execution timed out')), 2000),
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

  return { shortErrorLine, errorOutput, output, memory: peakMemory };
}

function generateRunnerCode(
  userCode: string,
  functionName: string,
  testCases: any[],
  lang: string,
): string {
  if (lang === 'javascript') {
    const tests = testCases
      .map(({ input, output }, idx) => {
        return `
  try {
    const result = ${functionName}(...${JSON.stringify(input)});
    const expected = JSON.parse(${JSON.stringify(output)});
    if (JSON.stringify(result) === JSON.stringify(expected)) {
      console.log("Test ${idx + 1} passed");
      codeAnswer.push(result);
      expectedCodeAnswer.push(expected);
    } else {
      console.log("Test ${idx + 1} failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(result));
      codeAnswer.push(result);
      expectedCodeAnswer.push(expected);
    }
    console.log("RESULT:", JSON.stringify(result));
  } catch (e) {
    console.log(e.stack);
  }
  `;
      })
      .join('\n');

    return `
  ${userCode}
  
  const codeAnswer = [];
  const expectedCodeAnswer = [];
  
  ${tests}
  
  return {
    codeAnswer,
    expectedCodeAnswer
  };
  `;
  }

  if (lang === 'python') {
    const tests = testCases
      .map(({ input, output }, idx) => {
        return `
try:
    result = ${functionName}(*${JSON.stringify(input)})
    expected = ${JSON.stringify(output)}
    if str(result) == expected:
        print("Test ${idx + 1} passed")
        codeAnswer.append(result)
        expectedCodeAnswer.append(result)
    else:
        print("Test ${idx + 1} failed: expected", expected, "got", result)
        codeAnswer.append(result)
        expectedCodeAnswer.append(expected)
    print("RESULT:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
`;
      })
      .join('\n');

    return `
${userCode}

codeAnswer = []
expectedCodeAnswer = []

${tests}
`;
  }
  return `# Unsupported language: ${lang}`;
}

function extractResultsFromOutput(output: string[]) {
  return output
    .filter((line) => line.startsWith('RESULT:'))
    .map((line) => line.replace('RESULT:', '').trim());
}
type ParsedTestCase = {
  input: [number[], number];
  output: any;
};

function parseTestCases(testCases: ITestCase[], isHidden: boolean): ParsedTestCase[] {
  return testCases
    .filter((test) => isHidden || !test.isHidden)
    .map((test) => {
      const [first, second] = test.input.map((i) => {
        try {
          return JSON.parse(i.value);
        } catch {
          return Number(i.value);
        }
      });

      const output = test.output[0];

      return {
        input: [first, second],
        output, // output là string
      };
    });
}

export const runAndSubmitCodeService = async (
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
    const testResult = parseTestCases(
      testInDb,
      codeActionType === CodeActionType.RUNCODE ? false : true,
    );
    if (!testResult) return;
    const testCases = testResult.map((tc) => ({
      input: tc.input,
      output: tc.output,
    }));
    const problemFunctionName = 'fourSum';
    const runnerCode = generateRunnerCode(typed_code, problemFunctionName, testCases, lang);
    const { shortErrorLine, errorOutput, output, memory } = await startDocker(lang, runnerCode);
    let match = extractErrorSnippet(output, lang);
    if (errorOutput || shortErrorLine) {
      match = errorOutput ? errorOutput : shortErrorLine;
    }
    if (match) {
      if (match) {
        // const errorLines = errorOutput
        //   ? errorOutput
        //   : output
        //       .split('\n')
        //       .filter(
        //         (line) =>
        //           line.includes('ReferenceError') ||
        //           line.includes('SyntaxError') ||
        //           line.includes('TypeError'),
        //       );
        const runCodeError: runCodeErrorType = {
          status_code: 20,
          lang,
          run_success: false,
          compile_error: `${shortErrorLine}` || 'Unknown error',
          full_compile_error: errorOutput ? errorOutput : output,
          status_runtime: 'N/A',
          memory: 0,
          code_answer: [],
          code_output: [],
          std_output_list: [''],
          task_finish_time: Date.now(),
          task_name: problem?.title as string,
          total_correct: 0,
          total_testcases: testCases.length,
          runtime_percentile: null,
          status_memory: 'N/A',
          memory_percentile: null,
          pretty_lang: lang,
          submission_id: new mongoose.Types.ObjectId().toString(),
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
    const actualResults =
      outputArray
        .filter((line) => line.includes('got'))
        .map((line) => line.split('got')[1].trim()) ?? [];

    let correctCount = 0;
    const expectedResults = testCases.map((t) => t.output);

    for (let i = 0; i < actualResults.length; i++) {
      if (actualResults[i] === expectedResults[i]) {
        correctCount++;
      }
    }

    const runCodeResult: RunCodeResultSuccessType = {
      status_code: results.length === total ? 15 : 20,
      lang,
      run_success: true,
      status_runtime: '0 ms',
      memory: memory,
      display_runtime: '0',
      code_answer: actualResults,
      code_output: results,
      std_output_list: [''],
      // std_output_list: outputArray.slice(0, outputArray.length - 1),
      elapsed_time: 0,
      task_finish_time: Date.now(),
      task_name: problem?.title as string,
      expected_status_code: 0,
      expected_lang: lang,
      expected_run_success: true,
      expected_status_runtime: '2000 ms',
      expected_memory: 0,
      expected_display_runtime: '0',
      expected_code_answer: testCases.map((t) => t.output),
      expected_code_output: [],
      expected_std_output_list: [],
      expected_elapsed_time: 0,
      expected_task_finish_time: Date.now(),
      expected_task_name: '',
      correct_answer: correctCount === total,
      compare_result: `${correctCount}/${total}`,
      total_correct: correctCount,
      total_testcases: total,
      runtime_percentile: null,
      memory_percentile: null,
      status_memory: 'N/A',
      pretty_lang: lang,
      submission_id: new mongoose.Types.ObjectId().toString(),
      status_msg: correctCount === total ? 'Accepted' : 'Wrong Answer',
      state: 'SUCCESS',
    };

    return runCodeResult;
  } catch (error) {
    console.log('run code errror.', error);
  }
};
