import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../lib/axios';

const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  metrics: {
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    recentWorkflows: [],
    recentExecutions: [],
  },

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/workflows/dashboard');
      set({ metrics: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchWorkflows: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/workflows', { params });
      set({ workflows: data.data.workflows, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/workflows/${id}`);
      set({
        currentWorkflow: data.data,
        nodes: data.data.nodes || [],
        edges: data.data.edges || [],
        isLoading: false,
      });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  createWorkflow: async (workflowData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/workflows', workflowData);
      set((state) => ({
        workflows: [data.data, ...state.workflows],
        isLoading: false,
      }));
      return data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateWorkflow: async (id, workflowData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put(`/workflows/${id}`, workflowData);
      set({ currentWorkflow: data.data, isLoading: false });
      return data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  duplicateWorkflow: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(`/workflows/${id}/duplicate`);
      set((state) => ({
        workflows: [data.data, ...state.workflows],
        isLoading: false,
      }));
      return data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/workflows/${id}`);
      set((state) => ({
        workflows: state.workflows.filter((w) => w._id !== id),
        currentWorkflow: state.currentWorkflow?._id === id ? null : state.currentWorkflow,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#6366f1' } }, get().edges),
    });
  },
}));

export default useWorkflowStore;
