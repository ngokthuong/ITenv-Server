import { Router } from 'express';
import { getProblems, getSingleProblem, insertProblems } from '../controllers/problem.controller';

const router = Router();
router.get('/insert', insertProblems);
router.get('/', getProblems);
router.get('/:slug', getSingleProblem);

export default router;
