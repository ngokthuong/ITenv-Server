import { Router } from 'express';
import { getProblems, getSingleProblem, insertProblemsController } from '../controllers/problem.controller';
import { ApiProblem } from '../enums/apiProblem.enum'
const router = Router();
router.post(ApiProblem.INSERT_PROBLEMS, insertProblemsController);
router.get(ApiProblem.GET_PROBLEMS, getProblems);
router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);

export default router;
