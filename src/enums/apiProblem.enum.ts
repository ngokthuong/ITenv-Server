export enum ApiProblem {
  INSERT_PROBLEMS = '',
  GET_PROBLEMS = '',
  GET_SINGLE_PROBLEM = '/:slug',
  PROBLEM_ACTIVITIES = '/problem-activities/:userId',

  RUNCODE = '/:name/run',
  SUBMIT = '/:name/submit',
  SUBMISSIONS = '/user/submissions/:userId',
  DETAIL_SUBMISSION = '/submission/:submissionId',

  // ----------------------------------------------------------ADMIN----------------------------------------------------------------------
  GET_AVGPROBLEMS_PER_USER = '/average/per-user',
  TOTAL_ACTIVE_PROBLEMS = '/total/active',
  TOTAL_ALL_PROBLEMS = '/total/all',
  SOLVER_PROBLEMS = '/solver',
  USER_ENGAGEMENT_PROBLEMS = '/engagement',
  DATA_PAGE = '/data/page',
  DELETE_PROBLEM = '/:_id',
  DAILY_SOLVED_PROBLEMS = '/chart/solved',
  REFACTOR_TYPED_CODE = '/refactor'
}
