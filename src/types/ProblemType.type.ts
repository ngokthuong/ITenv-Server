export interface SubmissionBody {
  lang: string; // Language of the submission (e.g., "python", "javascript")
  typed_code: string; // The code that the user has written
  question_id: number; // ID of the question being submitted
}
export type CodeSubmitType = {
  name: string;
  submissionBody: SubmissionBody;
};

export type RunCodeResultType = {
  status_code: number; // Status code of the execution
  lang: string; // Programming language used
  run_success: boolean; // Indicates if the run was successful
  status_runtime: string; // Runtime status (e.g., "0 ms")
  memory: number; // Memory used in bytes
  display_runtime?: string; // Runtime displayed (e.g., "0")
  code_answer: string[]; // List of answers produced by the code
  code_output: string[]; // List of actual outputs produced by the code
  std_output_list: string[]; // List of standard outputs
  expected_code_answer?: string[] | string; // Expected code answers
  expected_code_output?: string[]; // Expected code outputs
  expected_std_output_list?: string[]; // Expected standard outputs
  correct_answer?: boolean; // Whether the answer is correct
  compare_result?: string; // Result of comparison
  total_correct: number; // Number of correct answers
  total_testcases: number; // Total number of test cases
  status_memory: string; // Human-readable memory usage (e.g., "16.7 MB")
  submission_id?: string; // Unique submission ID
  status_msg: string; // Status message (e.g., "Accepted")
  state: string; // State of the submission (e.g., "SUCCESS")
  compile_error?: string;
  full_compile_error?: string;
};
