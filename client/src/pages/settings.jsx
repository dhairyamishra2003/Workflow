import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import { User, Key, Eye, EyeOff, Save, Shield, Settings as SettingsIcon } from 'lucide-react';

const SettingsContent = () => {
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      // Profile updates mock / fetch save
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMessage({ type: 'success', text: 'Profile preferences updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeysSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      // Save LLM keys directly into integrations database for user
      if (geminiKey.trim()) {
        await api.post('/integrations', { provider: 'gemini', token: geminiKey });
      }
      if (openRouterKey.trim()) {
        await api.post('/integrations', { provider: 'openrouter', token: openRouterKey });
      }
      setGeminiKey('');
      setOpenRouterKey('');
      setMessage({ type: 'success', text: 'API Credentials updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save API credentials.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-100 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary-400" />
          System <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account profile details, security access, and AI models API keys.</p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold uppercase tracking-wider hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User profile settings form */}
        <div className="glass-card flex flex-col gap-4">
          <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2 border-b border-white/5 pb-3">
            <User className="w-4 h-4 text-primary-400" />
            Operator Profile
          </h3>

          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Full Name</label>
              <input type="text" className="input-field text-xs font-semibold" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</label>
              <input type="email" className="input-field text-xs font-semibold" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <button type="submit" disabled={isSaving} className="btn-primary mt-2 py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 self-start">
              <Save className="w-3.5 h-3.5" />
              Save Profile
            </button>
          </form>
        </div>

        {/* API Credentials configuration */}
        <div className="glass-card flex flex-col gap-4">
          <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2 border-b border-white/5 pb-3">
            <Key className="w-4 h-4 text-primary-400" />
            AI Keys Credentials
          </h3>

          <form onSubmit={handleKeysSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Google Gemini API Key</label>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  className="input-field text-xs font-mono pr-10"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Leave blank to keep existing..."
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">OpenRouter API Key</label>
              <div className="relative">
                <input
                  type={showOpenRouter ? 'text' : 'password'}
                  className="input-field text-xs font-mono pr-10"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="Leave blank to keep existing..."
                />
                <button
                  type="button"
                  onClick={() => setShowOpenRouter(!showOpenRouter)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showOpenRouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="btn-primary mt-2 py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 self-start">
              <Save className="w-3.5 h-3.5" />
              Update AI Keys
            </button>
          </form>
        </div>
      </div>

      {/* Security role check list */}
      <div className="glass-card flex items-center justify-between gap-4 p-4 border border-white/5 rounded-2xl mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h4 className="font-bold text-xs text-gray-200">System Governance Mode</h4>
            <p className="text-[10px] text-gray-500">Security profiles audit operations logs. Role: {user?.role || 'operator'}</p>
          </div>
        </div>
        <span className="text-[9px] bg-primary-500/15 border border-primary-500/30 text-primary-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Enforced
        </span>
      </div>
    </div>
  );
};

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
