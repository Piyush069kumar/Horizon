import { activityRepository } from '../repositories/activity.repository';
import { AuthenticatedUserPayload } from '../types';

export class ActivityService {
  async getRecentActivity(user: AuthenticatedUserPayload, limit: number = 20) {
    return activityRepository.getRecentActivity(user, limit);
  }

  async getRecentActivityPaginated(user: AuthenticatedUserPayload, page: number = 1, limit: number = 20) {
    return activityRepository.getRecentActivityPaginated(user, page, limit);
  }

  async getProjectActivity(projectId: string) {
    return activityRepository.findByProject(projectId);
  }

  async getProjectActivityPaginated(projectId: string, page: number = 1, limit: number = 20) {
    return activityRepository.findByProjectPaginated(projectId, page, limit);
  }
}

export const activityService = new ActivityService();
