import { Response } from 'express';
import { CodeSandboxService } from '../services/codesanbox.service';
import { logEvents } from '../helper/logEvents';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';

const codeSandboxService = new CodeSandboxService();

export const createCodeSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId,
      };
      const sandbox = await codeSandboxService.create(data);
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Code sandbox created successfully',
      };
      res.status(201).json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const findCodeSandboxByIdController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandbox = await codeSandboxService.findById(req.params.id);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const findAllCodeSandboxesController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const sortField = (req.query.sortField as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'DESC';

      const [sandboxes, total] = await Promise.all([
        codeSandboxService.findAll({
          skip,
          limit,
          language: req.query.language as string,
          search,
          sortField,
          sortOrder: sortOrder as 'ASC' | 'DESC',
        }),
        codeSandboxService.count(),
      ]);

      const response: ResponseType<typeof sandboxes> = {
        success: true,
        data: sandboxes,
        total,
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const updateCodeSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandbox = await codeSandboxService.update(req.params.id, req.body);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Code sandbox updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const deleteCodeSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandbox = await codeSandboxService.delete(req.params.id);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<null> = {
        success: true,
        message: 'Code sandbox deleted successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const findCodeSandboxesByUserController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandboxes = await codeSandboxService.findByUser(req.params.userId);
      const response: ResponseType<typeof sandboxes> = {
        success: true,
        data: sandboxes,
        total: sandboxes.length,
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const addFileToSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { folderId } = req.query;
      const sandbox = await codeSandboxService.addFile(req.params.id, req.body, folderId as string);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'File added successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const updateFileInSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandbox = await codeSandboxService.updateFile(
        req.params.id,
        req.params.fileId,
        req.body,
      );
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox or file not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'File updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const deleteFileFromSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandbox = await codeSandboxService.deleteFile(req.params.id, req.params.fileId);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox or file not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'File deleted successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const addFolderToSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { folderName, parentFolderId } = req.body;
      if (!folderName) {
        res.status(400).json({ success: false, message: 'Folder name is required' });
        return;
      }
      const folder = await codeSandboxService.addFolder(req.params.id, folderName, parentFolderId);
      res.status(201).json({ success: true, data: folder, message: 'Folder added successfully' });
    } catch (error: any) {
      await logEvents(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

export const addMemberToSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, role } = req.body;
      const sandbox = await codeSandboxService.addMember(req.params.id, userId, role);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Member added successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const removeMemberFromSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const sandbox = await codeSandboxService.removeMember(req.params.id, userId);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Member removed successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const updateMemberRoleController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const sandbox = await codeSandboxService.updateMemberRole(req.params.id, userId, role);
      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox or member not found',
        };
        res.status(404).json(response);
        return;
      }
      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Member role updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      await logEvents(error.message);
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      res.status(500).json(response);
    }
  },
);

export const updateFolderInSandboxController = async (req: AuthRequest, res: Response) => {
  try {
    const { id, folderId } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const sandbox = await codeSandboxService.updateFolder(id, folderId, name);
    if (!sandbox) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json({ data: sandbox });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFolderFromSandboxController = async (req: AuthRequest, res: Response) => {
  try {
    const { id, folderId } = req.params;
    const sandbox = await codeSandboxService.deleteFolder(id, folderId);
    if (!sandbox) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    res.json({ data: sandbox });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
