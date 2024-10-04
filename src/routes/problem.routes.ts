import { Router } from 'express';
import { getProblems, getSingleProblem, insertProblems } from '../controllers/problem.controller';
import { ApiProblem } from '../enums/apiProblem.enum'
const router = Router();
router.get(ApiProblem.INSERT_PROBLEMS, insertProblems);
router.get(ApiProblem.GET_PROBLEMS, getProblems);
router.get(ApiProblem.GET_SINGLE_PROBLEM, getSingleProblem);

export default router;
