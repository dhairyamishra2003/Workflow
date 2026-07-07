import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import api from '../lib/axios';
import { Plug, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck, Mail, MessageSquare, Database, Wand } from 'lucide-react';
import { useRouter } from 'next/router';

const PROVIDER_METADATA = {
  gmail: { label: 'Gmail', icon: Mail, color: '#ea4335', desc: 'Send and read mail using Google API integrations' },
  slack: { label: 'Slack Workspace', icon: MessageSquare, color: '#4a154b', desc: 'Post automated notifications to channels and respond to events' },
  discord: { label: 'Discord Bot', icon: MessageSquare, color: '#5865f2', desc: 'Send alerts to discord channels using Bot access credentials' },
  'google-sheets': { label: 'Google Sheets', icon: Database, color: '#34a853', desc: 'Read ranges and append rows to spreadsheet datasets' },
  openrouter: { label: 'OpenRouter AI', icon: Wand, color: '#ff6b6b', desc: 'Construct nodes powered by top LLM agents' },
  gemini: { label: 'Google Gemini AI', icon: Wand, color: '#1a73e8', desc: 'Leverage Google Gemini Pro models for graph builder tasks' },
};

const IntegrationsContent = () => {
  const router = useRouter();
  const { success, error: queryError } = router.query;

  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [directForm, setDirectForm] = useState(null); // provider being configured directly
  const [tokenInput, setTokenInput] = useState('');
  const [refTokenInput, setRefTokenInput] = useState('');
  const [expiryInput, setExpiryInput] = useState('');
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/integrations/status');
      setProviders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (success) {
      setMessage({ type: 'success', text: 'Provider connected successfully!' });
      router.replace('/integrations', undefined, { shallow: true });
    }
    if (queryError) {
      setMessage({ type: 'error', text: 'Authentication failed. Please verify configurations.' });
      router.replace('/integrations', undefined, { shallow: true });
    }
  }, [success, queryError]);

  const handleStartOAuth = async (provider) => {
    try {
      const { data } = await api.get(`/integrations/oauth/${provider}/start`);
      if (data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initiate OAuth flow.' });
    }
  };

  const handleDirectConnect = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    try {
      await api.post('/integrations', {
        provider: directForm,
        token: tokenInput,
        refreshToken: refTokenInput || undefined,
        expiry: expiryInput || undefined,
      });
      setDirectForm(null);
      setTokenInput('');
      setRefTokenInput('');
      setExpiryInput('');
      setMessage({ type: 'success', text: `${directForm} direct configuration saved!` });
      fetchStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save configuration.' });
    }
  };

  const handleTestConnection = async (provider) => {
    setTestingId(provider);
    setTestResult((prev) => ({ ...prev, [provider]: null }));
    try {
      // Connect check runs connection test
      const { data } = await api.get('/integrations/status');
      const item = data.data.find((p) => p.provider === provider);
      setTestResult((prev) => ({
        ...prev,
        [provider]: item?.connected ? 'connected' : 'failed',
      }));
    } catch (err) {
      setTestResult((prev) => ({ ...prev, [provider]: 'failed' }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (window.confirm(`Are you sure you want to disconnect ${provider}?`)) {
      try {
        // Disconnect direct integration settings by connection delete / post empty
        await api.post('/integrations', {
          provider,
          token: ' ', // Empty spaces will clear / force status disconnect
        });
        setMessage({ type: 'success', text: `${provider} credentials removed.` });
        fetchStatus();
      } catch (err) {
        setMessage({ type: 'error', text: 'Disconnect failed.' });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-100 flex items-center gap-2">
            Third-Party <span className="gradient-text">Integrations</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Connect your cloud tools and LLM keys to enable multi-agent action executions.</p>
        </div>
        <button
          onClick={fetchStatus}
          className="btn-secondary self-start md:self-auto flex items-center gap-2 py-2.5 px-4 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Connections
        </button>
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

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && providers.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-48 w-full animate-pulse bg-white/[0.01]" />
          ))
        ) : (
          providers.map((item) => {
            const meta = PROVIDER_METADATA[item.provider] || { label: item.provider, icon: Plug, color: '#cbd5e1', desc: 'External custom resource' };
            const Icon = meta.icon;
            const isOauth = ['gmail', 'google-sheets', 'slack', 'discord'].includes(item.provider);

            return (
              <div key={item.provider} className="glass-card flex flex-col justify-between h-56">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <Icon className="w-6 h-6" style={{ color: meta.color }} />
                      </div>
                      <span className="font-bold text-sm text-gray-200">{meta.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.connected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5 uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3 text-gray-500" />
                          Offline
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-4 leading-normal font-medium">{meta.desc}</p>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4 mt-4">
                  {item.connected ? (
                    <>
                      <button
                        onClick={() => handleTestConnection(item.provider)}
                        disabled={testingId === item.provider}
                        className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-semibold"
                      >
                        {testingId === item.provider ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : testResult[item.provider] === 'connected' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        {testingId === item.provider ? 'Checking...' : testResult[item.provider] === 'connected' ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(item.provider)}
                        className="text-danger-400 hover:text-danger-500 text-xs font-semibold hover:underline"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <>
                      {isOauth ? (
                        <button
                          onClick={() => handleStartOAuth(item.provider)}
                          className="btn-primary text-[11px] py-2 px-3.5 font-semibold"
                        >
                          Connect Client
                        </button>
                      ) : (
                        <button
                          onClick={() => setDirectForm(item.provider)}
                          className="btn-primary text-[11px] py-2 px-3.5 font-semibold"
                        >
                          Configure API
                        </button>
                      )}
                      <button
                        onClick={() => setDirectForm(item.provider)}
                        className="text-primary-400 hover:text-primary-300 text-xs font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Keys
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Direct Connection Configuration Form Overlay Modal */}
      {directForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-6 relative flex flex-col gap-4 animate-fade-in">
            <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary-400" />
              Direct credentials for: {directForm.toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              Supply api-keys, bot credentials or access tokens directly to connect. Real OAuth operations will run where applicable.
            </p>

            <form onSubmit={handleDirectConnect} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Access Token / API Key</label>
                <input
                  type="password"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="Paste credentials..."
                />
              </div>

              {['gmail', 'google-sheets'].includes(directForm) && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Refresh Token (Optional)</label>
                    <input
                      type="password"
                      value={refTokenInput}
                      onChange={(e) => setRefTokenInput(e.target.value)}
                      className="input-field text-xs font-mono"
                      placeholder="Paste refresh token..."
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Token Expiry (Optional)</label>
                    <input
                      type="datetime-local"
                      value={expiryInput}
                      onChange={(e) => setExpiryInput(e.target.value)}
                      className="input-field text-xs cursor-pointer text-gray-300"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setDirectForm(null)}
                  className="btn-secondary text-xs py-2 px-3.5 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-3.5 font-semibold">
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Integrations() {
  return (
    <ProtectedRoute>
      <IntegrationsContent />
    </ProtectedRoute>
  );
}
