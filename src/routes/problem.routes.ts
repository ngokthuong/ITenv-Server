import { Router } from 'express';
import {
  AverageProblemsPerUserController,
  getDetailSubmissionController,
  getProblemsController,
  getSingleProblem,
  getSubmissionsByUserIdController,
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
router.post(ApiProblem.INSERT_PROBLEMS, insertProblemsController);
router.get(ApiProblem.GET_PROBLEMS, getProblemsController);
router.post(ApiProblem.RUNCODE, verifyAccessToken, runCodeController);
router.post(ApiProblem.SUBMIT, verifyAccessToken, submitProblemController);
router.get(ApiProblem.SUBMISSIONS, getSubmissionsByUserIdController);

router.get(ApiProblem.DETAIL_SUBMISSION, verifyAccessToken, getDetailSubmissionController);
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, AverageProblemsPerUserController);
// router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);

router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, AverageProblemsPerUserController);
// router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);

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

export default router;
