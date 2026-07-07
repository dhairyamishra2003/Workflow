import { create } from 'zustand';
import api from '../lib/axios';
import { getSocket } from '../lib/socket';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  markRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  markAllRead: async () => {
    try {
      await api.post('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  subscribeNotifications: (userId) => {
    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_user_notifications', { userId });

    socket.on('new_notification', (notification) => {
      set((state) => {
        const alreadyExists = state.notifications.some((n) => n._id === notification._id);
        if (alreadyExists) return state;
        return { notifications: [notification, ...state.notifications] };
      });
    });
  },

  unsubscribeNotifications: (userId) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('leave_user_notifications', { userId });
    socket.off('new_notification');
  },

  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },
}));

export default useNotificationStore;
