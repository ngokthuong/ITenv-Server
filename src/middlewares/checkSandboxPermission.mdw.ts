import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest.type';
import { CodeSandboxService } from '../services/codesanbox.service';
import { ResponseType } from '../types/Response.type';

const codeSandboxService = new CodeSandboxService();

export const checkSandboxPermission = (requiredRole: 'owner' | 'editor' | 'viewer' = 'viewer') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sandboxId = req.params.id;
      const sandbox = await codeSandboxService.findById(sandboxId);

      if (!sandbox) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Code sandbox not found',
        };
        return res.status(404).json(response);
      }

      // If sandbox is public and only viewer access is required, allow access without authentication
      if (sandbox.isPublic && requiredRole === 'viewer') {
        return next();
      }

      // For private sandboxes or higher permissions, require authentication
      const userId = req.user?.userId;
      if (!userId) {
        const response: ResponseType<null> = {
          success: false,
          message: 'Unauthorized access',
        };
        return res.status(401).json(response);
      }

      // Check if user is the creator
      if (sandbox.createdBy.toString() === userId) {
        return next();
      }

      // Check if user is a member with appropriate role
      const member = sandbox.members.find((m) => m.user.toString() === userId);
      if (!member) {
        const response: ResponseType<null> = {
          success: false,
          message: 'You do not have permission to access this sandbox',
        };
        return res.status(403).json(response);
      }

      // Check role permissions
      const roleHierarchy = {
        owner: 3,
        editor: 2,
        viewer: 1,
      };

      if (roleHierarchy[member.role] < roleHierarchy[requiredRole]) {
        const response: ResponseType<null> = {
          success: false,
          message: `You need ${requiredRole} permissions to perform this action`,
        };
        return res.status(403).json(response);
      }

      next();
    } catch (error: any) {
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      return res.status(500).json(response);
    }
  };
};
