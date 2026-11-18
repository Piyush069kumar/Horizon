import { prisma } from './prisma';
import { Role } from '@prisma/client';

export class ActivityRepository {
  async getRecentActivity(user: { id: string; role: Role }, limit: number = 20) {
    let where: any = {};

    if (user.role === Role.ADMIN) {
      // Global activity
      where = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // Latest activity from projects owned by this PM
      where = {
        project: { ownerId: user.id },
      };
    } else if (user.role === Role.DEVELOPER) {
      // Latest activity for tasks assigned to this developer
      where = {
        task: { assignedDeveloperId: user.id },
      };
    }

    return prisma.activityLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }

  async findByProject(projectId: string, limit: number = 50) {
    return prisma.activityLog.findMany({
      where: { projectId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }

  async getRecentActivityPaginated(user: { id: string; role: Role }, page: number = 1, limit: number = 20) {
    let where: any = {};

    if (user.role === Role.ADMIN) {
      where = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      where = {
        project: { ownerId: user.id },
      };
    } else if (user.role === Role.DEVELOPER) {
      where = {
        task: { assignedDeveloperId: user.id },
      };
    }

    const skip = (page - 1) * limit;
    const [activities, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async findByProjectPaginated(projectId: string, page: number = 1, limit: number = 20) {
    const where = { projectId };
    const skip = (page - 1) * limit;
    const [activities, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }
}

export const activityRepository = new ActivityRepository();
