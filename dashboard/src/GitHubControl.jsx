import React, { useState } from 'react';

// TODO: Replace with your real GitHub App install URL
const GITHUB_APP_INSTALL_URL = 'https://github.com/apps/YOUR_GITHUB_APP_NAME/installations/new';

export default function GitHubControl() {
  const [repo, setRepo] = useState('');
  const [pr, setPr] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [checkRun, setCheckRun] = useState(null);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyzePR() {
    setLoading(true);
    setError('');
    setVerdict(null);
    setCheckRun(null);
    setPassport(null);
    try {
      // 1. Analyze PR (calls backend, triggers pipeline)
      const response = await fetch(`/api/github/analyze-pr`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo, pr }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unknown error');
      setVerdict(data);

      // 2. Fetch Check Run status
      const checkRes = await fetch(`/api/github/check-run?repo=${encodeURIComponent(repo)}&pr=${encodeURIComponent(pr)}`);
      if (checkRes.ok) setCheckRun(await checkRes.json());

      // 3. Fetch Passport receipt (if any)
      const passRes = await fetch(`/api/github/passport-receipt?repo=${encodeURIComponent(repo)}&pr=${encodeURIComponent(pr)}`);
      if (passRes.ok) setPassport(await passRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>GitHub App Integration</h2>
      <div style={{ marginBottom: 16 }}>
        <a href={GITHUB_APP_INSTALL_URL} target="_blank" rel="noopener noreferrer" className="oauth-btn github">
          Install GitHub App
        </a>
      </div>
      <div className="row">
        <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repo" />
        <input value={pr} onChange={e => setPr(e.target.value)} placeholder="PR number" type="number" />
        <button onClick={analyzePR} disabled={loading || !repo || !pr}>Analyze PR</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {verdict && (
        <div style={{ marginTop: 16 }}>
          <h3>PR Analysis</h3>
          <pre>{JSON.stringify(verdict, null, 2)}</pre>
        </div>
      )}
      {checkRun && (
        <div style={{ marginTop: 16 }}>
          <h3>Check Run Status</h3>
          <pre>{JSON.stringify(checkRun, null, 2)}</pre>
        </div>
      )}
      {passport && (
        <div style={{ marginTop: 16 }}>
          <h3>Passport Receipt</h3>
          <pre>{JSON.stringify(passport, null, 2)}</pre>
        </div>
      )}
      <div style={{ marginTop: 24, fontSize: '0.95em', color: '#aaa' }}>
        <ul>
          <li>1. Install the GitHub App on your repo/org</li>
          <li>2. Enter <b>owner/repo</b> and <b>PR number</b></li>
          <li>3. Analyze PR to see Check Run and Passport status</li>
        </ul>
      </div>
    </div>
  );
}
