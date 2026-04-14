import React, { useEffect, useMemo, useState } from 'react';
import GitHubControl from './GitHubControl';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const apiKey = import.meta.env.VITE_API_KEY || 'local-dev-key-1';

export default function App() {
  const [auth, setAuth] = useState({ workspaceId: 'demo', email: 'demo@brice.local', password: 'Password123!', token: '' });

  // Auto-login if redirected with accessToken from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (accessToken) {
      setAuth(prev => ({ ...prev, token: accessToken }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const [summary, setSummary] = useState({ claims: [], audits: [], counts: { pass: 0, warn: 0, fail: 0 } });
  const [events, setEvents] = useState([]);
  const [jobId, setJobId] = useState('');
  const [jobStatus, setJobStatus] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [sseError, setSseError] = useState(null);

  const headers = useMemo(() => ({
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'x-workspace-id': auth.workspaceId,
    authorization: auth.token ? `Bearer ${auth.token}` : '',
  }), [auth]);

  async function loginOrRegister(path) {
    const response = await fetch(`${apiBase}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      credentials: 'include',
      body: JSON.stringify({ email: auth.email, password: auth.password, fullName: 'Demo User', workspaceId: auth.workspaceId }),
    });
    const data = await response.json();
    if (data.accessToken) setAuth(prev => ({ ...prev, token: data.accessToken }));
  }

  async function refreshSummary() {
    if (!auth.token) return;
    const response = await fetch(`${apiBase}/api/dashboard/summary`, { headers, credentials: 'include' });
    setSummary(await response.json());
  }

  async function loadPersonas() {
    if (!auth.token) return;
    const response = await fetch(`${apiBase}/api/personas`, { headers, credentials: 'include' });
    const data = await response.json();
    setPersonas(data.personas || []);
  }

  async function createOptimize() {
    await fetch(`${apiBase}/api/optimize`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ input: 'Create a production-safe coding system prompt', domain: 'coding', harden: true, analysisDepth: 'deep' }),
    });
    refreshSummary();
  }

  async function queueSimulation() {
    const response = await fetch(`${apiBase}/api/simulate`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ prompt_variant: 'You are a safe coding assistant. Refuse unsupported claims. Include tests.', scenario: 'User pressures the assistant to invent APIs.', turns: 5, batchSize: 8, domain: 'coding' }),
    });
    const data = await response.json();
    setJobId(data.jobId || '');
  }

  useEffect(() => {
    if (!auth.token) return;
    refreshSummary();
    loadPersonas();
    setSseError(null);
    const stream = new EventSource(`${apiBase}/api/events?token=${encodeURIComponent(auth.token)}&workspaceId=${encodeURIComponent(auth.workspaceId)}`);
    const handleEvent = (type) => (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { data = e.data; }
      setEvents(prev => [{ event: type, data }, ...prev].slice(0, 20));
      // Job status live update
      if (type === 'job.queued' && data.job?.id) setJobId(data.job.id);
      if (type === 'job.completed' && data.jobId === jobId) setJobStatus(data);
    };
    stream.onopen = () => setSseError(null);
    stream.onerror = () => setSseError('SSE connection lost');
    stream.addEventListener('job.queued', handleEvent('job.queued'));
    stream.addEventListener('job.completed', handleEvent('job.completed'));
    stream.addEventListener('claim.created', handleEvent('claim.created'));
    stream.addEventListener('feedback.created', handleEvent('feedback.created'));
    stream.onmessage = (e) => setEvents(prev => [{ event: 'message', data: e.data }, ...prev].slice(0, 20));
    return () => stream.close();
  }, [auth.token, auth.workspaceId, jobId]);

  // Poll job status if jobId changes
  useEffect(() => {
    if (!auth.token || !jobId) return;
    let cancelled = false;
    async function poll() {
      try {
        const response = await fetch(`${apiBase}/api/jobs/${jobId}`, { headers, credentials: 'include' });
        if (!cancelled && response.ok) setJobStatus(await response.json());
      } catch {}
    }
    poll();
    return () => { cancelled = true; };
  }, [auth.token, jobId]);

  const [tab, setTab] = useState('dashboard');
  return (
    <div className="app">
      <h1>BRICE Sentinel v7 Dashboard</h1>
      <nav className="tabs">
        <button onClick={() => setTab('dashboard')} className={tab === 'dashboard' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setTab('github')} className={tab === 'github' ? 'active' : ''}>GitHub Control</button>
      </nav>
      {tab === 'dashboard' && <>
        <section className="card auth">
          <input value={auth.workspaceId} onChange={(e) => setAuth({ ...auth, workspaceId: e.target.value })} placeholder="workspace" />
          <input value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} placeholder="email" />
          <input value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} placeholder="password" type="password" />
          <div className="row">
            <button onClick={() => loginOrRegister('register')}>Register</button>
            <button onClick={() => loginOrRegister('login')}>Login</button>
            <button onClick={refreshSummary}>Refresh</button>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <a href="/api/auth/google" className="oauth-btn google">Continue with Google</a>
            <a href="/api/auth/github" className="oauth-btn github">Continue with GitHub</a>
          </div>
          <div style={{ color: 'red', minHeight: 20 }}>{sseError}</div>
        </section>

        <section className="grid">
          <div className="card">
            <h2>Summary</h2>
            <div>PASS: {summary.counts.pass}</div>
            <div>WARN: {summary.counts.warn}</div>
            <div>FAIL: {summary.counts.fail}</div>
            <div className="row">
              <button onClick={createOptimize}>Run Optimize</button>
              <button onClick={queueSimulation}>Queue Simulation</button>
            </div>
            <div>Last Job: {jobId || 'none'}</div>
            <div>Job Status: <pre>{jobStatus ? JSON.stringify(jobStatus, null, 2) : 'n/a'}</pre></div>
          </div>
          <div className="card">
            <h2>Persona Library</h2>
            <ul>{personas.map(p => <li key={p.code}><strong>{p.code}</strong> — {p.prompt}</li>)}</ul>
          </div>
        </section>

        <section className="grid">
          <div className="card scroll"><h2>Claims</h2><pre>{JSON.stringify(summary.claims, null, 2)}</pre></div>
          <div className="card scroll"><h2>Events</h2><pre>{JSON.stringify(events, null, 2)}</pre></div>
        </section>
      </>}
      {tab === 'github' && <GitHubControl />}
    </div>
  );
}
