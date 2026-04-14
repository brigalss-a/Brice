const { EventEmitter } = require('events');
const clients = new Map();
const broadcast = new EventEmitter();

function addClient(workspaceId, res) {
  if (!clients.has(workspaceId)) clients.set(workspaceId, new Set());
  clients.get(workspaceId).add(res);
}

function removeClient(workspaceId, res) {
  if (!clients.has(workspaceId)) return;
  clients.get(workspaceId).delete(res);
}

// Emit a global event for SSE
function emitEvent(event) {
  broadcast.emit('event', event);
}

module.exports = { addClient, removeClient, broadcast, emitEvent };
