import { Router } from 'express';
import { getProblems, insertProblems } from '../controllers/problem.controller';

const router = Router();
router.get('/insert', insertProblems);
router.get('/', getProblems);

export default router;
