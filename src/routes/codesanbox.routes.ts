import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';
import {
  createCodeSandboxController,
  findCodeSandboxByIdController,
  findAllCodeSandboxesController,
  updateCodeSandboxController,
  deleteCodeSandboxController,
  findCodeSandboxesByUserController,
  addFileToSandboxController,
  updateFileInSandboxController,
  deleteFileFromSandboxController,
  addFolderToSandboxController,
  updateFolderInSandboxController,
  deleteFolderFromSandboxController,
} from '../controllers/codesanbox.controller';

const router = Router();

// Public routes
router.get('/', findAllCodeSandboxesController);
router.get('/:id', findCodeSandboxByIdController);
router.get('/user/:userId', findCodeSandboxesByUserController);

// Protected routes
router.post('/', verifyAccessToken, isUser, createCodeSandboxController);
router.put('/:id', verifyAccessToken, isUser, updateCodeSandboxController);
router.delete('/:id', verifyAccessToken, isUser, deleteCodeSandboxController);

// File management routes
router.post('/:id/files', verifyAccessToken, isUser, addFileToSandboxController);
router.put('/:id/files/:fileId', verifyAccessToken, isUser, updateFileInSandboxController);
router.delete('/:id/files/:fileId', verifyAccessToken, isUser, deleteFileFromSandboxController);

// Folder management routes
router.post('/:id/folders', verifyAccessToken, isUser, addFolderToSandboxController);
router.put('/:id/folders/:folderId', verifyAccessToken, isUser, updateFolderInSandboxController);
router.delete(
  '/:id/folders/:folderId',
  verifyAccessToken,
  isUser,
  deleteFolderFromSandboxController,
);

export default router;
