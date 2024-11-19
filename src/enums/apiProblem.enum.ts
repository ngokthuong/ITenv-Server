export enum ApiProblem {
  INSERT_PROBLEMS = '',
  GET_PROBLEMS = '',
  GET_SINGLE_PROBLEM = '/:slug',

  RUNCODE = '/:name/run',
  SUBMIT = '/:name/submit',
  DETAIL_SUBMISSION='/submission/:submissionId',

  // ----------------------------------------------------------ADMIN----------------------------------------------------------------------
  GET_AVGPROBLEMS_PER_USER = '/average/per-user'
}
