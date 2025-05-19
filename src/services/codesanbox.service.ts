import { CodeSandbox, ICodeSandbox } from '../models/codeSandbox';
import { CodeSandboxFileType, CodeSandboxStatus } from '../enums/codeSandbox.enum';
import mongoose from 'mongoose';
import { CodeSandboxFile, ICodeSandboxFile } from '../models/fileSanbox';
import { CodeSandboxFolder, ICodeSandboxFolder } from '../models/folderSanbox';
import { SandboxRequirement } from '../models/sandboxRequirement';

type PlainFolder = Omit<ICodeSandboxFolder, keyof Document>;
type PlainFile = Omit<ICodeSandboxFile, keyof Document>;
type PlainSandbox = Omit<ICodeSandbox, keyof Document>;

interface FolderWithContent extends PlainFolder {
  files: PlainFile[];
  folders: FolderWithContent[];
}

interface SandboxWithContent extends PlainSandbox {
  files: PlainFile[];
  folders: FolderWithContent[];
}

interface PaginationParams {
  skip: number;
  limit: number;
  language?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
  search?: string;
  createdBy?: string;
}

export class CodeSandboxService {
  async create(data: Partial<ICodeSandbox>): Promise<ICodeSandbox> {
    const members = [
      {
        user: data.createdBy,
        role: 'owner',
        joinedAt: new Date(),
      },
    ];

    // const rootFolder = {
    //   name: data.name,
    //   files: [],
    //   folders: [],
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };

    const sandbox = new CodeSandbox({
      ...data,
      members,
    });
    return await sandbox.save();
  }

  async findById(id: string): Promise<SandboxWithContent | null> {
    const sandbox = await CodeSandbox.findById(id).populate('createdBy', 'username avatar');
    if (!sandbox) return null;

    // Get all folders for this sandbox
    const folders = await CodeSandboxFolder.find({ sandboxId: id });

    // Get all files for this sandbox
    const files = await CodeSandboxFile.find({ sandboxId: id });

    // Build folder tree
    const buildFolderTree = (
      parentId: mongoose.Types.ObjectId | null = null,
    ): FolderWithContent[] => {
      const children = folders.filter((f) => f.parentFolder?.toString() === parentId?.toString());

      return children.map((folder) => {
        const folderObj = folder.toObject() as PlainFolder;
        const folderId = folderObj._id as mongoose.Types.ObjectId;
        return {
          ...folderObj,
          files: files
            .filter((f) => f.parentFolder?.toString() === folderId.toString())
            .map((f) => f.toObject() as PlainFile),
          folders: buildFolderTree(folderId),
        };
      });
    };

    // Add root level files and folders to sandbox
    const sandboxObj = {
      ...sandbox.toObject(),
      files: files.filter((f) => !f.parentFolder).map((f) => f.toObject() as PlainFile) || [],
      folders: buildFolderTree() || [],
    } as unknown as SandboxWithContent;

    return sandboxObj;
  }

  async findAll({
    skip = 0,
    limit = 10,
    language,
    createdBy,
    sortField = 'createdAt',
    sortOrder = 'DESC',
    search,
  }: PaginationParams): Promise<ICodeSandbox[]> {
    const filter: any = {};
    if (language) {
      filter.language = { $in: [language] };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (createdBy) filter.createdBy = createdBy;
    const sort: any = {};
    sort[sortField] = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;

    return await CodeSandbox.find(filter)
      .populate('createdBy', 'username avatar')
      .populate({
        path: 'members.user',
        select: 'username avatar _id',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(): Promise<number> {
    return await CodeSandbox.countDocuments();
  }

  async update(id: string, data: Partial<ICodeSandbox>): Promise<ICodeSandbox | null> {
    return await CodeSandbox.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    );
  }

  async delete(id: string): Promise<ICodeSandbox | null> {
    return await CodeSandbox.findByIdAndUpdate(
      id,
      { status: CodeSandboxStatus.DELETED },
      { new: true },
    );
  }

  async findByUser(userId: string): Promise<ICodeSandbox[]> {
    return await CodeSandbox.find({
      createdBy: new mongoose.Types.ObjectId(userId),
      status: CodeSandboxStatus.ACTIVE,
    }).sort({ updatedAt: -1 });
  }

  async addFolder(
    sandboxId: string,
    folderName: string,
    parentFolderId?: string,
  ): Promise<ICodeSandboxFolder> {
    if (!folderName.trim()) throw new Error('Folder name cannot be empty');
    // Check for duplicate in the same parent
    const exists = await CodeSandboxFolder.findOne({
      sandboxId,
      parentFolder: parentFolderId || null,
      name: folderName,
    });
    if (exists) throw new Error('A folder with this name already exists in this location');
    const folder = await CodeSandboxFolder.create({
      name: folderName,
      sandboxId,
      parentFolder: parentFolderId || null,
    });
    return folder;
  }

  async addFile(sandboxId: string, file: any, parentFolderId?: string): Promise<ICodeSandboxFile> {
    if (!file.name || !file.type) throw new Error('File name and type are required');
    // Check for duplicate in the same parent
    const exists = await CodeSandboxFile.findOne({
      sandboxId,
      parentFolder: parentFolderId || null,
      name: file.name,
    });
    if (exists) throw new Error('A file with this name already exists in this location');
    const newFile = await CodeSandboxFile.create({
      ...file,
      sandboxId,
      parentFolder: parentFolderId || null,
    });
    return newFile;
  }

  async addImageFile(
    sandboxId: string,
    file: Express.Multer.File,
    parentFolderId?: string,
  ): Promise<ICodeSandboxFile> {
    if (!file.originalname || !file.mimetype) throw new Error('File name and type are required');

    // Get file extension and determine file type
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    let fileType: CodeSandboxFileType;
    switch (extension) {
      case 'png':
        fileType = CodeSandboxFileType.PNG;
        break;
      case 'jpg':
      case 'jpeg':
        fileType = CodeSandboxFileType.JPG;
        break;
      case 'gif':
        fileType = CodeSandboxFileType.GIF;
        break;
      case 'svg':
        fileType = CodeSandboxFileType.SVG;
        break;
      default:
        throw new Error('Unsupported image format');
    }

    // Check for duplicate in the same parent
    const exists = await CodeSandboxFile.findOne({
      sandboxId,
      parentFolder: parentFolderId || null,
      name: file.originalname,
    });
    if (exists) throw new Error('A file with this name already exists in this location');

    // Create new file record
    const newFile = await CodeSandboxFile.create({
      name: file.originalname,
      type: fileType,
      sandboxId,
      parentFolder: parentFolderId || null,
      isImage: true,
      imageUrl: file.path, // Cloudinary URL
      imageSize: file.size,
      imageMimeType: file.mimetype,
    });

    return newFile;
  }

  async updateFile(
    sandboxId: string,
    fileId: string,
    fileData: any,
  ): Promise<ICodeSandboxFile | null> {
    return await CodeSandboxFile.findOneAndUpdate(
      {
        _id: fileId,
        sandboxId: sandboxId,
      },
      {
        $set: {
          ...fileData,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { new: true },
    );
  }

  async deleteFile(sandboxId: string, fileId: string): Promise<ICodeSandboxFile | null> {
    return await CodeSandboxFile.findOneAndDelete({
      _id: fileId,
      sandboxId: sandboxId,
    });
  }

  async addMember(
    sandboxId: string,
    userId: string,
    role: 'owner' | 'editor' | 'viewer',
  ): Promise<ICodeSandbox | null> {
    return await CodeSandbox.findByIdAndUpdate(
      sandboxId,
      {
        $push: {
          members: {
            user: new mongoose.Types.ObjectId(userId),
            role,
            joinedAt: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async removeMember(sandboxId: string, userId: string): Promise<ICodeSandbox | null> {
    return await CodeSandbox.findByIdAndUpdate(
      sandboxId,
      {
        $pull: {
          members: { user: new mongoose.Types.ObjectId(userId) },
        },
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async updateMemberRole(
    sandboxId: string,
    userId: string,
    role: 'owner' | 'editor' | 'viewer',
  ): Promise<ICodeSandbox | null> {
    return await CodeSandbox.findOneAndUpdate(
      {
        _id: sandboxId,
        'members.user': new mongoose.Types.ObjectId(userId),
      },
      {
        $set: {
          'members.$.role': role,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async updateFolder(
    sandboxId: string,
    folderId: string,
    newName: string,
  ): Promise<ICodeSandboxFolder | null> {
    if (!newName.trim()) {
      throw new Error('Folder name cannot be empty');
    }

    const folder = await CodeSandboxFolder.findOne({
      _id: folderId,
      sandboxId,
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check for duplicate name in the same parent
    const exists = await CodeSandboxFolder.findOne({
      sandboxId,
      parentFolder: folder.parentFolder,
      name: newName,
      _id: { $ne: folderId },
    });

    if (exists) {
      throw new Error('A folder with this name already exists in this location');
    }

    folder.name = newName;
    folder.updatedAt = new Date();
    return await folder.save();
  }

  async deleteFolder(sandboxId: string, folderId: string): Promise<ICodeSandboxFolder | null> {
    const folder = await CodeSandboxFolder.findOne({
      _id: folderId,
      sandboxId,
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    // Delete all child folders and files
    await CodeSandboxFolder.deleteMany({
      sandboxId,
      parentFolder: folderId,
    });

    await CodeSandboxFile.deleteMany({
      sandboxId,
      parentFolder: folderId,
    });

    return await CodeSandboxFolder.findByIdAndDelete(folderId);
  }

  async requestAccess(
    sandboxId: string,
    requesterId: string,
    role: 'owner' | 'editor' | 'viewer',
    message?: string,
  ): Promise<any> {
    // Check if sandbox exists
    const sandbox = await CodeSandbox.findById(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    // Check if user is already a member
    const isMember = sandbox.members.some((member) => member.user.toString() === requesterId);
    if (isMember) {
      throw new Error('You are already a member of this sandbox');
    }

    // Check if user already has a pending request
    const existingRequest = await SandboxRequirement.findOne({
      sandbox: sandboxId,
      requester: requesterId,
      status: 'pending',
    });
    if (existingRequest) {
      throw new Error('You already have a pending request for this sandbox');
    }

    // Create new request
    const request = await SandboxRequirement.create({
      sandbox: sandboxId,
      requester: requesterId,
      requestedRole: role,
      message,
      status: 'pending',
    });

    return request;
  }

  async getAccessRequests(sandboxId: string): Promise<any[]> {
    // Check if sandbox exists
    const sandbox = await CodeSandbox.findById(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    // Get all requests for this sandbox
    const requests = await SandboxRequirement.find({ sandbox: sandboxId })
      .populate('requester', 'username avatar _id')
      .sort({ createdAt: -1 });

    return requests;
  }

  async handleAccessRequest(requestId: string, action: 'approve' | 'reject'): Promise<any> {
    const request = await SandboxRequirement.findById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (action === 'approve') {
      // Add member to sandbox
      await this.addMember(
        request.sandbox.toString(),
        request.requester.toString(),
        request.requestedRole,
      );
      request.status = 'approved';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      throw new Error('Invalid action');
    }

    await request.save();
    return request;
  }

  async deleteAccessRequest(requestId: string): Promise<any> {
    const request = await SandboxRequirement.findByIdAndDelete(requestId);
    if (!request) {
      throw new Error('Request not found');
    }
    return request;
  }
}
