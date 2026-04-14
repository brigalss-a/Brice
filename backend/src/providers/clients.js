const env = require('../config/env');

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`upstream_${response.status}:${text.slice(0, 200)}`);
  return JSON.parse(text);
}

function availableProviders() {
  return Object.entries(env.providers)
    .filter(([, cfg]) => cfg.apiKey && cfg.model)
    .map(([name]) => name);
}

async function callProvider(provider, { systemPrompt, userPrompt, maxTokens = 800 }) {
  if (!provider) {
    return { provider: 'local-fallback', model: 'heuristic', text: `${systemPrompt}\n\nAnswer boundedly. ${userPrompt}` };
  }

  if (provider === 'openai') {
    const data = await fetchJson('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.providers.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: env.providers.openai.model,
        temperature: 0.1,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    return { provider, model: env.providers.openai.model, text: data.choices?.[0]?.message?.content || '' };
  }

  if (provider === 'anthropic') {
    const data = await fetchJson('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.providers.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.providers.anthropic.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    return {
      provider,
      model: env.providers.anthropic.model,
      text: (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n'),
    };
  }

  if (provider === 'gemini') {
    const data = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.providers.gemini.model)}:generateContent?key=${encodeURIComponent(env.providers.gemini.apiKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens },
      }),
    });
    return {
      provider,
      model: env.providers.gemini.model,
      text: data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '',
    };
  }

  throw new Error(`unsupported_provider:${provider}`);
}

module.exports = { availableProviders, callProvider };
