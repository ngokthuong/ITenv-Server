import { Router } from 'express';
import {
  AverageProblemsPerUserController,
  deletedProblemsByAdminController,
  getAllTotalDataInProblemPageController,
  getDailysolvedProblemsController,
  getDetailSubmissionController,
  getProblemsController,
  getProblemsDataDistributionByYearController,
  getSingleProblem,
  getSubmissionsByUserIdController,
  getTopProblemSolversController,
  getTotalActiveProblemsController,
  getTotalProblemsController,
  insertProblemsController,
  runCodeController,
  submitProblemController,
} from '../controllers/problem.controller';
import { ApiProblem } from '../enums/apiProblem.enum';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin } from '../middlewares/verify_roles';

const router = Router();


// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
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
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);
router.get(ApiProblem.SOLVER_PROBLEMS, verifyAccessToken, isAdmin, getTopProblemSolversController)
router.get(ApiProblem.USER_ENGAGEMENT_PROBLEMS, verifyAccessToken, isAdmin, getProblemsDataDistributionByYearController)
router.get(ApiProblem.DATA_PAGE, verifyAccessToken, isAdmin, getAllTotalDataInProblemPageController);
router.get(ApiProblem.DAILY_SOLVED_PROBLEMS, verifyAccessToken, isAdmin, getDailysolvedProblemsController);


// ----------------------------------------------------------USER-----------------------------------------------------------------

router.post(ApiProblem.INSERT_PROBLEMS, insertProblemsController);
router.get(ApiProblem.GET_PROBLEMS, getProblemsController);
router.post(ApiProblem.RUNCODE, verifyAccessToken, runCodeController);
router.post(ApiProblem.SUBMIT, verifyAccessToken, submitProblemController);
router.get(ApiProblem.SUBMISSIONS, getSubmissionsByUserIdController);

router.get(ApiProblem.DETAIL_SUBMISSION, verifyAccessToken, isAdmin, getDetailSubmissionController);

router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);
router.post(ApiProblem.DELETE_PROBLEM, deletedProblemsByAdminController);





export default router;
