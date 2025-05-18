import { Response } from 'express';
import { CodeSandboxService } from '../services/codesanbox.service';
import { logEvents } from '../helper/logEvents';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import { CodeSandboxFileType } from '../enums/codeSandbox.enum';
import { SandboxRequirement } from '../models/sandboxRequirement';

const codeSandboxService = new CodeSandboxService();

const getFileTypeFromExtension = (fileName: string): CodeSandboxFileType => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return CodeSandboxFileType.JAVASCRIPT;
    case 'ts':
    case 'tsx':
      return CodeSandboxFileType.TYPESCRIPT;
    case 'html':
      return CodeSandboxFileType.HTML;
    case 'css':
      return CodeSandboxFileType.CSS;
    case 'json':
      return CodeSandboxFileType.JSON;
    case 'md':
      return CodeSandboxFileType.MARKDOWN;
    case 'py':
      return CodeSandboxFileType.PYTHON;
    case 'java':
      return CodeSandboxFileType.JAVA;
    case 'c':
    case 'cpp':
      return CodeSandboxFileType.CPP;
    case 'png':
      return CodeSandboxFileType.PNG;
    case 'jpg':
    case 'jpeg':
      return CodeSandboxFileType.JPG;
    case 'gif':
      return CodeSandboxFileType.GIF;
    case 'svg':
      return CodeSandboxFileType.SVG;
    default:
      return CodeSandboxFileType.OTHER;
  }
};

const validateAndFormatFileName = (
  fileName: string,
): { isValid: boolean; message?: string; formattedName?: string } => {
  // Check if filename is empty or only whitespace
  if (!fileName || !fileName.trim()) {
    return { isValid: false, message: 'File name is required' };
  }

  // Remove leading/trailing whitespace
  let formattedName = fileName.trim();

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(formattedName)) {
    return {
      isValid: false,
      message:
        'File name contains invalid characters. Cannot contain: < > : " / \\ | ? * or control characters',
    };
  }

  // Check if filename is too long (255 characters is a common limit)
  if (formattedName.length > 255) {
    return { isValid: false, message: 'File name is too long (maximum 255 characters)' };
  }

  // Ensure the file has an extension
  if (!formattedName.includes('.')) {
    return { isValid: false, message: 'File must have an extension' };
  }

  // Split into name and extension
  const lastDotIndex = formattedName.lastIndexOf('.');
  const name = formattedName.substring(0, lastDotIndex);
  const extension = formattedName.substring(lastDotIndex + 1).toLowerCase();

  // Check if name part is empty
  if (!name) {
    return { isValid: false, message: 'File name cannot be empty' };
  }

  // Check if extension is empty
  if (!extension) {
    return { isValid: false, message: 'File extension cannot be empty' };
  }

  // Format the name (remove extra spaces, convert to lowercase)
  formattedName = `${name.trim()}.${extension}`;

  return { isValid: true, formattedName };
};

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
      const createdBy = req.query.createdBy;
      const sortField = (req.query.sortField as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'DESC';

      const [sandboxes, total] = await Promise.all([
        codeSandboxService.findAll({
          skip,
          limit,
          language: req.query.language as string,
          search,
          createdBy: (createdBy as string) || '',
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
      const { name } = req.body;

      // Validate and format the file name
      const validationResult = validateAndFormatFileName(name);
      if (!validationResult.isValid) {
        const response: ResponseType<null> = {
          success: false,
          message: validationResult.message || 'Invalid file name',
        };
        res.status(400).json(response);
        return;
      }

      const fileType = getFileTypeFromExtension(validationResult.formattedName!);
      const fileData = {
        ...req.body,
        name: validationResult.formattedName,
        type: fileType,
      };

      const sandbox = await codeSandboxService.addFile(req.params.id, fileData, folderId as string);
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
      const { name } = req.body;

      // If name is being updated, validate and format it
      if (name) {
        const validationResult = validateAndFormatFileName(name);
        if (!validationResult.isValid) {
          const response: ResponseType<null> = {
            success: false,
            message: validationResult.message || 'Invalid file name',
          };
          res.status(400).json(response);
          return;
        }

        // Update the file type based on the new extension
        const fileType = getFileTypeFromExtension(validationResult.formattedName!);
        req.body = {
          ...req.body,
          name: validationResult.formattedName,
          type: fileType,
        };
      }

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
    const { folderName: name } = req.body;

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

export const addImageToSandboxController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        const response: ResponseType<null> = {
          success: false,
          message: 'No file uploaded',
        };
        res.status(400).json(response);
        return;
      }

      const { folderId } = req.query;
      const sandbox = await codeSandboxService.addImageFile(
        req.params.id,
        req.file,
        folderId as string,
      );

      const response: ResponseType<typeof sandbox> = {
        success: true,
        data: sandbox,
        message: 'Image added successfully',
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

export const requestAccessController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { role, message } = req.body;
      const sandboxId = req.params.id;
      const requesterId = req.user?.userId;

      if (!requesterId) {
        const response: ResponseType<null> = {
          success: false,
          message: 'User not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const request = await codeSandboxService.requestAccess(sandboxId, requesterId, role, message);

      const response: ResponseType<typeof request> = {
        success: true,
        data: request,
        message: 'Access request submitted successfully',
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

export const getAccessRequestsController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sandboxId = req.params.id;
      const requests = await codeSandboxService.getAccessRequests(sandboxId);

      const response: ResponseType<typeof requests> = {
        success: true,
        data: requests,
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

export const handleAccessRequestController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { action } = req.body;

      const request = await codeSandboxService.handleAccessRequest(requestId, action);

      const response: ResponseType<typeof request> = {
        success: true,
        data: request,
        message: `Request ${action}ed successfully`,
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

export const deleteAccessRequestController = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const request = await codeSandboxService.deleteAccessRequest(requestId);

      const response: ResponseType<null> = {
        success: true,
        message: 'Request deleted successfully',
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
