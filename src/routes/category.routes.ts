import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';
import { createCategoryController, deleteCategoryController, findCatesOfPostsController, findCatesOfProblemsController, updateCategoryController } from '../controllers/category.controller';

const router = Router();

router.post('/create', createCategoryController);

router.get('/posts/get-cates', findCatesOfPostsController);
router.get('/problems/get-cates', findCatesOfProblemsController);
router.put('/update', updateCategoryController);
router.delete('/delete', deleteCategoryController);

export default router;
