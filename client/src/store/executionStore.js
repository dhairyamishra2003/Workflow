import { create } from 'zustand';
import api from '../lib/axios';
import { getSocket } from '../lib/socket';

const useExecutionStore = create((set, get) => ({
  executions: [],
  currentExecution: null,
  timeline: [],
  isLoading: false,
  error: null,

  fetchExecutions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/executions', { params });
      set({ executions: data.data.executions, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchExecution: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/executions/${id}`);
      set({
        currentExecution: data.data.execution,
        isLoading: false,
      });
      return data.data.execution;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchTimeline: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/executions/${id}/timeline`);
      set({ timeline: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  executeWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workflows/${workflowId}/execute`);
      set((state) => ({
        executions: [data.data, ...state.executions],
        isLoading: false,
      }));
      return data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  pauseExecution: async (id) => {
    try {
      const { data } = await api.post(`/executions/${id}/pause`);
      set({ currentExecution: data.data });
      return data.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  resumeExecution: async (id) => {
    try {
      const { data } = await api.post(`/executions/${id}/resume`);
      set({ currentExecution: data.data });
      return data.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  cancelExecution: async (id) => {
    try {
      const { data } = await api.post(`/executions/${id}/cancel`);
      set({ currentExecution: data.data });
      return data.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  subscribeToExecution: (executionId) => {
    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_execution', { executionId });

    socket.on('execution_log', (log) => {
      // Append logs to timeline in real time
      set((state) => {
        const alreadyExists = state.timeline.some((t) => t._id === log._id);
        if (alreadyExists) return state;
        return { timeline: [...state.timeline, log] };
      });
    });

    socket.on('execution_status_change', (statusData) => {
      set((state) => {
        if (state.currentExecution?._id === statusData.executionId) {
          return {
            currentExecution: {
              ...state.currentExecution,
              status: statusData.status,
              completedAt: statusData.completedAt,
              duration: statusData.duration,
              output: statusData.output,
              error: statusData.error,
            },
          };
        }
        return state;
      });
    });
  },

  unsubscribeFromExecution: (executionId) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('leave_execution', { executionId });
    socket.off('execution_log');
    socket.off('execution_status_change');
  },
}));

export default useExecutionStore;
