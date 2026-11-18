import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { QueryClient } from '@tanstack/react-query';
import { playNotificationSound } from '../utils/audio';

let socket: Socket | null = null;
let activeOnlineUsersCount = 1;
let activeOnlineUserIds: string[] = [];
const countListeners = new Set<(count: number) => void>();
const presenceListeners = new Set<(data: { activeUsersCount: number; activeUserIds: string[] }) => void>();
const notificationAlertListeners = new Set<() => void>();

export function connectSocket(queryClient: QueryClient) {
  const token = useAuthStore.getState().accessToken;
  if (!token) return;

  // Singleton guard: if a socket instance is already active or in-flight, reuse it!
  if (socket) {
    return socket;
  }

  const targetUrl = import.meta.env.VITE_API_URL || window.location.origin;

  socket = io(targetUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
  });

  // Ensure clean listeners without duplicates
  socket.off('connect');
  socket.on('connect', () => {
    console.log('⚡ Socket.IO connected:', socket?.id);
  });

  socket.off('presence:update');
  socket.on('presence:update', (data: { activeUsersCount: number; activeUserIds?: string[] }) => {
    activeOnlineUsersCount = data.activeUsersCount;
    activeOnlineUserIds = data.activeUserIds || [];
    countListeners.forEach((fn) => fn(activeOnlineUsersCount));
    presenceListeners.forEach((fn) =>
      fn({ activeUsersCount: activeOnlineUsersCount, activeUserIds: activeOnlineUserIds })
    );
  });

  socket.off('activity:created');
  socket.on('activity:created', (newActivity) => {
    console.log('🔔 Real-time activity received:', newActivity);
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  });

  socket.off('notification:created');
  socket.on('notification:created', (newNotification) => {
    console.log('🔔 Real-time notification received:', newNotification);

    // Play subtle audio chime (debounced inside audio.ts)
    playNotificationSound();

    // Trigger visual in-app toast notification with unique ID to prevent duplicate toasts
    if (newNotification?.message) {
      const toastId = newNotification.id ? `notification-${newNotification.id}` : undefined;
      toast(newNotification.message, {
        id: toastId,
        icon: '🔔',
        duration: 5000,
      });
    }

    // Trigger badge animation on notification bell
    notificationAlertListeners.forEach((fn) => fn());

    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.off('disconnect');
  socket.on('disconnect', () => {
    console.log('🔌 Socket.IO disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function joinProjectRoom(projectId: string) {
  if (socket && socket.connected) {
    socket.emit('join:project', projectId);
  }
}

export function leaveProjectRoom(projectId: string) {
  if (socket && socket.connected) {
    socket.emit('leave:project', projectId);
  }
}

export function subscribePresence(callback: (count: number) => void) {
  countListeners.add(callback);
  callback(activeOnlineUsersCount);
  return () => {
    countListeners.delete(callback);
  };
}

export function subscribePresenceDetails(
  callback: (data: { activeUsersCount: number; activeUserIds: string[] }) => void
) {
  presenceListeners.add(callback);
  callback({ activeUsersCount: activeOnlineUsersCount, activeUserIds: activeOnlineUserIds });
  return () => {
    presenceListeners.delete(callback);
  };
}

export function getActiveOnlineUserIds(): string[] {
  return activeOnlineUserIds;
}

export function subscribeNotificationAlert(callback: () => void) {
  notificationAlertListeners.add(callback);
  return () => {
    notificationAlertListeners.delete(callback);
  };
}

export function getSocket() {
  return socket;
}
