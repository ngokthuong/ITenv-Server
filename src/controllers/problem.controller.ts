import asyncHandler from 'express-async-handler';
import Problem, { IProblem, ITestCase } from '../models/problem';
import { ResponseType } from '../types/Response.type';
import {
  AverageProblemsPerUserService,
  deletedProblemsByAdminService,
  DeleteProblemService,
  getAllTotalDataInProblemPageService,
  getDailysolvedProblemsService,
  getProblemsDataDistributionByYearService,
  getProblemsService,
  getTopProblemSolversService,
  getTotalActiveProblemsService,
  getTotalProblemsService,
  insertProblems,
  submit,
  upSertProblemService,
} from '../services/problem.service';
import { checkSubmissionStatus, runCode, submissionDetail } from '../services/problem.service';
import { AuthRequest } from '../types/AuthRequest.type';
import {
  RunCodeResultSuccessType,
  runCodeErrorType,
  SubmissionBody,
} from '../types/ProblemType.type';
import axios from 'axios';
import submission from '../models/submission';
import { SubmitType } from '../types/SubmitType';
import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PassThrough } from 'stream';
const docker = new Docker();
const TIMEOUT = 2000;
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
type ProblemWithoutOutput = Omit<IProblem, 'testCase'> & {
  testCase?: Omit<ITestCase, 'output'>[];
};

export const getSingleProblem = asyncHandler(async (req: any, res: any) => {
  const { slug } = req.params;
  try {
    const problem = await Problem.findOne({ slug: slug, isDeleted: false }).lean();
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    const filteredTestCases = problem.testCase
      ?.filter((testCase) => !testCase.isHidden)
      .map(({ output, ...rest }) => rest);
    const safeProblem = {
      ...problem,
      testCase: filteredTestCases,
    };
    let response: ResponseType<typeof safeProblem> = {
      data: safeProblem,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      status = await checkSubmissionStatus(interpret_id, titleSlug);
      retryCount += 1;
    } while (
      (status?.data?.state === 'PENDING' || status?.data?.state === 'STARTED') &&
      retryCount < maxRetries
    );

    if (retryCount >= maxRetries) {
      return res.status(408).json({ message: 'Submission status check timed out.' });
    }
    return res.status(200).json({ success: true, data: status?.data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
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

async function startDocker(
  lang: string,
  typed_code: string,
): Promise<{ output: string; memory: number }> {
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

  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('⏰ Code execution timed out')), 2000),
  );

  const streamEndPromise = new Promise<void>((resolve, reject) => {
    stream.on('end', () => {
      if (errorOutput) {
        const match = errorOutput.match(/at .*\/main\.(js|ts):\d+:\d+/);
        const shortErrorLine = match ? match[0] : 'Unknown line';
        reject(new Error(`Code execution failed at ${shortErrorLine}\n${errorOutput}`));
      } else {
        resolve();
      }
    });
  });

  await Promise.race([streamEndPromise, timeoutPromise]);
  const stats = await container.stats({ stream: false });
  const memoryUsage = stats.memory_stats.usage;
  await container.remove({ force: true });
  return { output, memory: memoryUsage };
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
  const result = JSON.stringify(${functionName}(...${JSON.stringify(input)}));
  const expected = JSON.stringify(${JSON.stringify(output)});
  if (result === expected) {
    console.log("Test ${idx + 1} passed");
    codeAnswer.push(result);
    expectedCodeAnswer.push(result);
  } else {
    console.log("Test ${idx + 1} failed: expected " + expected + ", got " + result);
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  }
  console.log("RESULT:" + result);
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
    if result == expected:
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

interface Input {
  name: string;
  value: string | number;
}

type ParsedTestCase = {
  input: [number[], number];
  output: number[][];
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
      const output = test.output.map((o) => JSON.parse(o));
      return {
        input: [first, second],
        output,
      };
    });
}

export const runCodeControllerNew = async (req: AuthRequest, res: any) => {
  try {
    const { lang, typed_code }: SubmitType = req.body;
    const { name: titleSlug } = req.params;
    if (!titleSlug || !lang || !typed_code) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const problem = await Problem.findOne({ slug: titleSlug });
    let testInDb = problem?.testCase;
    if (!testInDb) return;
    // isHidden false -> get test case with isHidden = false
    const testResult = parseTestCases(testInDb, false);
    if (!testResult) return;
    const testCases = testResult.map((tc) => ({
      input: tc.input,
      output: tc.output,
    }));
    const problemFunctionName = 'fourSum';
    const runnerCode = generateRunnerCode(typed_code, problemFunctionName, testCases, lang);
    console.log(runnerCode);
    const { output, memory } = await startDocker(lang, runnerCode);
    const match = output.match(/at .*\/main\.(js|ts|py):\d+:\d+/);

    if (match) {
      if (match) {
        const errorLines = output
          .split('\n')
          .filter(
            (line) =>
              line.includes('ReferenceError') ||
              line.includes('SyntaxError') ||
              line.includes('TypeError'),
          );

        const runCodeError: runCodeErrorType = {
          status_code: 20,
          lang,
          run_success: false,
          compile_error: `${errorLines[0]}` || 'Unknown error',
          full_compile_error: output,
          status_runtime: 'N/A',
          memory: 0,
          code_answer: [],
          code_output: [],
          std_output_list: [''],
          task_finish_time: Date.now(),
          task_name: problem?.title as string,
          total_correct: null,
          total_testcases: null,
          runtime_percentile: null,
          status_memory: 'N/A',
          memory_percentile: null,
          pretty_lang: lang,
          submission_id: new mongoose.Types.ObjectId().toString(),
          status_msg: 'Compile Error',
          state: 'SUCCESS',
        };
        return res.json({
          success: false,
          data: runCodeError,
        });
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
    const correct = results.filter((res, i) => res === JSON.stringify(testCases[i].output)).length;
    // code answer
    const actualResults =
      outputArray
        .filter((line) => line.includes('got'))
        .map((line) => line.split('got')[1].trim()) ?? [];

    const runCodeResult: RunCodeResultSuccessType = {
      status_code: correct === total ? 15 : 20,
      lang,
      run_success: correct === total,
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
      expected_status_runtime: '0 ms',
      expected_memory: 0,
      expected_display_runtime: '0',
      expected_code_answer: testCases.map((t) => JSON.stringify(t.output)),
      expected_code_output: [],
      expected_std_output_list: [],
      expected_elapsed_time: 0,
      expected_task_finish_time: Date.now(),
      expected_task_name: '',
      correct_answer: correct === total,
      compare_result: `${correct}/${total}`,
      total_correct: correct,
      total_testcases: total,
      runtime_percentile: null,
      memory_percentile: null,
      status_memory: 'N/A',
      pretty_lang: lang,
      submission_id: new mongoose.Types.ObjectId().toString(),
      status_msg: correct === total ? 'Accepted' : 'Wrong Answer',
      state: 'SUCCESS',
    };

    return res.json({
      success: runCodeResult.run_success,
      data: runCodeResult,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error submitting problem',
    });
  }
};

export const submitProblemController = asyncHandler(async (req: AuthRequest, res: any) => {
  const { lang, question_id, typed_code } = req.body;
  const { name: titleSlug } = req.params;
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
    if (axios.isAxiosError(error)) {
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
    res.status(500).json({ message: 'Server Error', error });
  }
});
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------

export const UpSertProblemController = asyncHandler(async (req: AuthRequest, res: any) => {
  const payload: IProblem = req.body;
  const result = await upSertProblemService(payload);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const DeleteProblemController = asyncHandler(async (req: AuthRequest, res: any) => {
  const { _id } = req.params;
  const result = await DeleteProblemService(_id);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

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
