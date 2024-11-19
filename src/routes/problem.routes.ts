import { Router } from 'express';
import {
  AverageProblemsPerUserController,
  getDetailSubmissionController,
  getProblemsController,
  getSingleProblem,
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
router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);
router.post(ApiProblem.RUNCODE, verifyAccessToken, runCodeController);
router.post(ApiProblem.SUBMIT, verifyAccessToken, submitProblemController);
router.get(ApiProblem.DETAIL_SUBMISSION, verifyAccessToken, getDetailSubmissionController);
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, AverageProblemsPerUserController);
// router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);

// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, AverageProblemsPerUserController);
// router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);



export default router;
