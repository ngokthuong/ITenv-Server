export interface SubmissionBody {
  lang: string; // Language of the submission (e.g., "python", "javascript")
  typed_code: string; // The code that the user has written
  question_id: number; // ID of the question being submitted
}
export type CodeSubmitType = {
  name: string;
  submissionBody: SubmissionBody;
};
