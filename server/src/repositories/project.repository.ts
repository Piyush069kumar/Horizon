import { prisma } from './prisma';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';
import { Prisma } from '@prisma/client';

export class ProjectRepository {
  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          include: {
            assignedDeveloper: { select: { id: true, name: true, email: true } },
          },
          orderBy: { dueDate: 'asc' },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async findAll(ownerId?: string) {
    return prisma.project.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForDeveloper(developerId: string) {
    return prisma.project.findMany({
      where: {
        tasks: {
          some: {
            assignedDeveloperId: developerId,
          },
        },
      },
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(options: {
    ownerId?: string;
    developerId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ProjectWhereInput = {};

    if (options.ownerId) {
      where.ownerId = options.ownerId;
    }

    if (options.developerId) {
      where.tasks = {
        some: {
          assignedDeveloperId: options.developerId,
        },
      };
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const page = options.page || 1;
    const limit = options.limit || 9;
    const skip = (page - 1) * limit;

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, name: true, company: true } },
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async create(data: CreateProjectInput & { ownerId: string }) {
    return prisma.project.create({
      data,
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}

export const projectRepository = new ProjectRepository();
