import { Router } from 'express';
import {
  AverageProblemsPerUserController,
  getProblemsController,
  getSingleProblem,
  getTotalActiveProblemsController,
  getTotalProblemsController,
  insertProblemsController,
} from '../controllers/problem.controller';
import { ApiProblem } from '../enums/apiProblem.enum';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin } from '../middlewares/verify_roles';
const router = Router();
router.post(ApiProblem.INSERT_PROBLEMS, insertProblemsController);
router.get(ApiProblem.GET_PROBLEMS, getProblemsController);
router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);

// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get(ApiProblem.GET_AVGPROBLEMS_PER_USER, verifyAccessToken, isAdmin, AverageProblemsPerUserController);
router.get(ApiProblem.TOTAL_ACTIVE_PROBLEMS, verifyAccessToken, isAdmin, getTotalActiveProblemsController);
router.get(ApiProblem.TOTAL_ALL_PROBLEMS, verifyAccessToken, isAdmin, getTotalProblemsController);



export default router;
