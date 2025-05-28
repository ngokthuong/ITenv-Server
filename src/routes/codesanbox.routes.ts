import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';
import { checkSandboxPermission } from '../middlewares/checkSandboxPermission.mdw';
import uploadCloud from '../config/cloudinary';
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
  addImageToSandboxController,
  requestAccessController,
  getAccessRequestsController,
  handleAccessRequestController,
  deleteAccessRequestController,
} from '../controllers/codesanbox.controller';
import { compileCodeController } from '../controllers/problem.controller';
const router = Router();

// Public routes (only for viewing)
router.get('/', findAllCodeSandboxesController);
router.get('/user/:userId', findCodeSandboxesByUserController);

// Protected routes that need authentication
router.get(
  '/:id',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('viewer'),
  findCodeSandboxByIdController,
);
router.post('/', verifyAccessToken, isUser, createCodeSandboxController);
router.put(
  '/:id',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  updateCodeSandboxController,
);
router.delete(
  '/:id',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('owner'),
  deleteCodeSandboxController,
);

// File management routes
router.post(
  '/:id/files',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  addFileToSandboxController,
);
router.put(
  '/:id/files/:fileId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  updateFileInSandboxController,
);
router.delete(
  '/:id/files/:fileId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  deleteFileFromSandboxController,
);

// Image upload route
router.post(
  '/:id/images',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  uploadCloud.single('image'),
  addImageToSandboxController,
);

// Folder management routes
router.post(
  '/:id/folders',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  addFolderToSandboxController,
);
router.put(
  '/:id/folders/:folderId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  updateFolderInSandboxController,
);
router.delete(
  '/:id/folders/:folderId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('editor'),
  deleteFolderFromSandboxController,
);

// Access request routes
router.post('/:id/request-access', verifyAccessToken, isUser, requestAccessController);

router.get(
  '/:id/access-requests',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('owner'),
  getAccessRequestsController,
);

router.put(
  '/:id/access-requests/:requestId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('owner'),
  handleAccessRequestController,
);

router.delete(
  '/:id/access-requests/:requestId',
  verifyAccessToken,
  isUser,
  checkSandboxPermission('owner'),
  deleteAccessRequestController,
);
router.post('/compile', verifyAccessToken, isUser, compileCodeController);

export default router;
