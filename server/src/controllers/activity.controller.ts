import { Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { AuthenticatedRequest } from '../types';

export class ActivityController {
  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 20;
      const result = await activityService.getRecentActivityPaginated(req.user, page, limit);
      return res.json({
        success: true,
        data: result.activities,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return this.getRecent(req, res, next);
      }
      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 20;
      const result = await activityService.getProjectActivityPaginated(projectId, page, limit);
      return res.json({
        success: true,
        data: result.activities,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
