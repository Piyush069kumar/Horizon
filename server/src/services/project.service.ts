import { projectRepository } from '../repositories/project.repository';
import { CreateProjectInput, UpdateProjectInput, ProjectFilterQuery } from '../validators/project.validator';
import { AppError } from '../utils/errors';
import { Role } from '@prisma/client';
import { AuthenticatedUserPayload } from '../types';

export class ProjectService {
  async getProjectsForUser(user: AuthenticatedUserPayload, filter: ProjectFilterQuery = { page: 1, limit: 9 }) {
    if (user.role === Role.ADMIN) {
      return projectRepository.findPaginated({
        search: filter.search,
        page: filter.page,
        limit: filter.limit,
      });
    } else if (user.role === Role.PROJECT_MANAGER) {
      return projectRepository.findPaginated({
        ownerId: user.id,
        search: filter.search,
        page: filter.page,
        limit: filter.limit,
      });
    } else if (user.role === Role.DEVELOPER) {
      return projectRepository.findPaginated({
        developerId: user.id,
        search: filter.search,
        page: filter.page,
        limit: filter.limit,
      });
    }
    return {
      projects: [],
      totalCount: 0,
      page: filter.page,
      limit: filter.limit,
      totalPages: 1,
    };
  }

  async getProjectById(id: string, user: AuthenticatedUserPayload) {
    const project = await projectRepository.findById(id);
    if (!project) throw AppError.notFound('Project not found');

    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw AppError.forbidden('You do not have permission to view projects owned by another Project Manager');
    }

    if (user.role === Role.DEVELOPER) {
      const hasAssignedTask = project.tasks.some(t => t.assignedDeveloperId === user.id);
      if (!hasAssignedTask) {
        throw AppError.forbidden('You do not have access to this project');
      }
    }

    return project;
  }

  async createProject(input: CreateProjectInput, user: AuthenticatedUserPayload) {
    const ownerId = user.role === Role.ADMIN && input.ownerId ? input.ownerId : user.id;
    return projectRepository.create({
      ...input,
      ownerId,
    });
  }

  async updateProject(id: string, input: UpdateProjectInput, user: AuthenticatedUserPayload) {
    const project = await this.getProjectById(id, user);
    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw AppError.forbidden('You can only modify projects you created');
    }
    return projectRepository.update(id, input);
  }

  async deleteProject(id: string, user: AuthenticatedUserPayload) {
    const project = await this.getProjectById(id, user);
    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw AppError.forbidden('You can only delete projects you created');
    }
    return projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
