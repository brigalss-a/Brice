const listeners = new Set();

function publish(event) {
  const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of listeners) {
    try {
      res.write(payload);
    } catch (_) {
      listeners.delete(res);
    }
  }
}

function register(res) {
  listeners.add(res);
  return () => listeners.delete(res);
}

module.exports = { publish, register };
