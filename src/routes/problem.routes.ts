import { Router } from 'express';
import {
  AverageProblemsPerUserController,
  deletedProblemsByAdminController,
  getAllTotalDataInProblemPageController,
  getDailysolvedProblemsController,
  getDetailSubmissionController,
  getProblemActivitiesController,
  getProblemsController,
  getProblemsDataDistributionByYearController,
  getSingleProblem,
  getSubmissionsByUserIdController,
  getTopProblemSolversController,
  getTotalActiveProblemsController,
  getTotalProblemsController,
  runCodeControllerRefactor,
  submitProblemController,
  UpSertProblemController,
  DeleteProblemController,
} from '../controllers/problem.controller';
import { ApiProblem } from '../enums/apiProblem.enum';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin, isUser } from '../middlewares/verify_roles';

const router = Router();

// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
// create
router.post(ApiProblem.INSERT_PROBLEMS, verifyAccessToken, isAdmin, UpSertProblemController);
router.delete(ApiProblem.DELETE_PROBLEM, verifyAccessToken, isAdmin, DeleteProblemController);

router.get(
  ApiProblem.GET_AVGPROBLEMS_PER_USER,
  verifyAccessToken,
  isAdmin,
  AverageProblemsPerUserController,
);
router.get(
  ApiProblem.TOTAL_ACTIVE_PROBLEMS,
  verifyAccessToken,
  isAdmin,
  getTotalActiveProblemsController,
);
router.get(ApiProblem.TOTAL_ALL_PROBLEMS, verifyAccessToken, isAdmin, getTotalProblemsController);
router.get(
  ApiProblem.GET_AVGPROBLEMS_PER_USER,
  verifyAccessToken,
  isAdmin,
  AverageProblemsPerUserController,
);
router.get(ApiProblem.SOLVER_PROBLEMS, verifyAccessToken, isAdmin, getTopProblemSolversController);
router.get(
  ApiProblem.USER_ENGAGEMENT_PROBLEMS,
  verifyAccessToken,
  isAdmin,
  getProblemsDataDistributionByYearController,
);
router.get(
  ApiProblem.DATA_PAGE,
  verifyAccessToken,
  isAdmin,
  getAllTotalDataInProblemPageController,
);
router.get(
  ApiProblem.DAILY_SOLVED_PROBLEMS,
  verifyAccessToken,
  isAdmin,
  getDailysolvedProblemsController,
);

// ----------------------------------------------------------USER-----------------------------------------------------------------

// router.post(ApiProblem.INSERT_PROBLEMS, insertProblemsController);
router.get(ApiProblem.GET_PROBLEMS, getProblemsController);
// router.post(ApiProblem.RUNCODE, verifyAccessToken, isUser, runCodeController);
router.post(ApiProblem.RUNCODE, verifyAccessToken, isUser, runCodeControllerRefactor);
// router.post(ApiProblem.SUBMIT, verifyAccessToken, isUser, submitProblemController);
router.post(ApiProblem.SUBMIT, verifyAccessToken, isUser, submitProblemController);
router.get(ApiProblem.SUBMISSIONS, getSubmissionsByUserIdController);
router.get(ApiProblem.PROBLEM_ACTIVITIES, getProblemActivitiesController);
router.get(ApiProblem.DETAIL_SUBMISSION, verifyAccessToken, getDetailSubmissionController);

router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);
router.get(ApiProblem.DETAIL_SUBMISSION, verifyAccessToken, getDetailSubmissionController);
router.post(ApiProblem.DELETE_PROBLEM, deletedProblemsByAdminController);

export default router;
