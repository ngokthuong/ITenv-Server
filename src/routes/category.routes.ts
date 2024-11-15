import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';
import { createCategoryController, deleteCategoryController, findCatesOfPostsController, findCatesOfProblemsController, updateCategoryController } from '../controllers/category.controller';
import { isAdmin } from '../middlewares/verify_roles';

const router = Router();

router.post('', verifyAccessToken, isAdmin, createCategoryController);

router.get('/posts', findCatesOfPostsController);
router.get('/problems', findCatesOfProblemsController);
router.put('', verifyAccessToken, isAdmin, updateCategoryController);
router.delete('', verifyAccessToken, isAdmin, deleteCategoryController);

export default router;
