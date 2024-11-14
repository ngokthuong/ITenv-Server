import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';
import { createCategoryController, deleteCategoryController, findCatesOfPostsController, findCatesOfProblemsController, updateCategoryController } from '../controllers/category.controller';

const router = Router();

router.post('', createCategoryController);

router.get('/posts', findCatesOfPostsController);
router.get('/problems', findCatesOfProblemsController);
router.put('', updateCategoryController);
router.delete('', deleteCategoryController);

export default router;
