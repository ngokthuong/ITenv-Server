import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';
import { createCategoryController, deleteCategoryController, findCatesOfPostsController, findCatesOfProblemsController, updateCategoryController } from '../controllers/category.controller';

const router = Router();

router.post('/create', verifyAccessToken, createCategoryController);

router.get('/posts/get-cates', verifyAccessToken, findCatesOfPostsController);
router.get('/problems/get-cates', verifyAccessToken, findCatesOfProblemsController);
router.put('/update', verifyAccessToken, updateCategoryController);
router.delete('/delete', verifyAccessToken, deleteCategoryController);

export default router;
