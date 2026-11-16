import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { QueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;
let activeOnlineUsersCount = 1;
let activeOnlineUserIds: string[] = [];
const countListeners = new Set<(count: number) => void>();
const presenceListeners = new Set<(data: { activeUsersCount: number; activeUserIds: string[] }) => void>();

export function connectSocket(queryClient: QueryClient) {
  const token = useAuthStore.getState().accessToken;
  if (!token) return;

  if (socket && socket.connected) return socket;

  const targetUrl = import.meta.env.VITE_API_URL || window.location.origin;

  socket = io(targetUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket.IO connected:', socket?.id);
  });

  socket.on('presence:update', (data: { activeUsersCount: number; activeUserIds?: string[] }) => {
    activeOnlineUsersCount = data.activeUsersCount;
    activeOnlineUserIds = data.activeUserIds || [];
    countListeners.forEach((fn) => fn(activeOnlineUsersCount));
    presenceListeners.forEach((fn) =>
      fn({ activeUsersCount: activeOnlineUsersCount, activeUserIds: activeOnlineUserIds })
    );
  });

  socket.on('activity:created', (newActivity) => {
    console.log('🔔 Real-time activity received:', newActivity);
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  });

  socket.on('notification:created', (newNotification) => {
    console.log('🔔 Real-time notification received:', newNotification);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket.IO disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
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

export function getSocket() {
  return socket;
}
