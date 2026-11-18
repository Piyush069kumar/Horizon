import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../utils/errors';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return notificationRepository.findByRecipient(userId);
  }

  async getUserNotificationsPaginated(userId: string, page: number = 1, limit: number = 20) {
    return notificationRepository.findByRecipientPaginated(userId, page, limit);
  }

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    await notificationRepository.markAsRead(id, userId);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    await notificationRepository.deleteById(id, userId);
    return { success: true };
  }

  async clearAllNotifications(userId: string) {
    await notificationRepository.deleteAllByRecipient(userId);
    return { success: true };
  }
}

export const notificationService = new NotificationService();
