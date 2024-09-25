import { Router } from "express";
import { insertProblems } from "../controllers/problem.comtroller";

const router = Router();
router.get('/insert', insertProblems);

export default router;