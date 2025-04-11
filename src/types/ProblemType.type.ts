export interface SubmissionBody {
  lang: string; // Language of the submission (e.g., "python", "javascript")
  typed_code: string; // The code that the user has written
  question_id: number; // ID of the question being submitted
}
export type CodeSubmitType = {
  name: string;
  submissionBody: SubmissionBody;
};

export type RunCodeResultSuccessType = {
  status_code: number; // Status code of the execution
  lang: string; // Programming language used
  run_success: boolean; // Indicates if the run was successful
  status_runtime: string; // Runtime status (e.g., "0 ms")
  memory: number; // Memory used in bytes
  display_runtime: string; // Runtime displayed (e.g., "0")
  code_answer: string[]; // List of answers produced by the code
  code_output: string[]; // List of actual outputs produced by the code
  std_output_list: string[]; // List of standard outputs
  elapsed_time: number; // Time taken to execute in ms
  task_finish_time: number; // Time when the task finished (timestamp)
  task_name: string; // Name of the task executed
  expected_status_code: number; // Expected status code
  expected_lang: string; // Expected programming language
  expected_run_success: boolean; // Expected success status
  expected_status_runtime: string; // Expected runtime status
  expected_memory: number; // Expected memory usage
  expected_display_runtime: string; // Expected runtime displayed
  expected_code_answer: string[]; // Expected code answers
  expected_code_output: string[]; // Expected code outputs
  expected_std_output_list: string[]; // Expected standard outputs
  expected_elapsed_time: number; // Expected elapsed time in ms
  expected_task_finish_time: number; // Expected task finish time (timestamp)
  expected_task_name: string; // Expected task name
  correct_answer: boolean; // Whether the answer is correct
  compare_result: string; // Result of comparison
  total_correct: number; // Number of correct answers
  total_testcases: number; // Total number of test cases
  runtime_percentile: number | null; // Percentile of runtime (nullable)
  status_memory: string; // Human-readable memory usage (e.g., "16.7 MB")
  memory_percentile: number | null; // Percentile of memory usage (nullable)
  pretty_lang: string; // Pretty name for the language (e.g., "Python3")
  submission_id: string; // Unique submission ID
  status_msg: string; // Status message (e.g., "Accepted")
  state: string; // State of the submission (e.g., "SUCCESS")
};

export type runCodeErrorType = {
  status_code: number;
  lang: string;
  run_success: boolean;
  compile_error: string;
  full_compile_error: string;
  status_runtime: string;
  memory: number;
  code_answer: string[];
  code_output: string[];
  std_output_list: string[];
  task_finish_time: number;
  task_name: string;
  total_correct: number | null;
  total_testcases: number | null;
  runtime_percentile: number | null;
  status_memory: string;
  memory_percentile: number | null;
  pretty_lang: string;
  submission_id: string;
  status_msg: string;
  state: string;
};
