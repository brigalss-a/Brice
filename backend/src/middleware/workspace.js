async function requireWorkspaceMembership(storage, req, res, next) {
  const { workspaceId, userId } = req.auth || {};
  if (!workspaceId || !userId) {
    return res.status(400).json({ error: 'workspace_context_missing' });
  }

  let membership = null;
  if (typeof storage.getMembership === 'function') {
    membership = await storage.getMembership(workspaceId, userId);
  } else {
    const rows = await storage.listMemberships();
    membership = rows.find((m) => m.workspace_id === workspaceId && m.user_id === userId) || null;
  }

  if (!membership) {
    return res.status(403).json({ error: 'workspace_forbidden', message: 'No membership for this workspace' });
  }

  req.membership = membership;
  next();
}

module.exports = { requireWorkspaceMembership };
