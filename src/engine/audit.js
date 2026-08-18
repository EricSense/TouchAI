import { makeId, nowIso } from './ids.js';

export function log(state, entry) {
  const record = {
    id: makeId('aud'),
    at: entry.at ?? nowIso(),
    actor: entry.actor,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    rationale: entry.rationale ?? '',
    detail: entry.detail ?? null,
  };
  state.audit.unshift(record);
  return record;
}

export function requireActor(actor, action) {
  if (!actor || !actor.id || !actor.name || !actor.role) {
    throw new Error(`${action} requires a named actor with a role`);
  }
}

export function requireAllocator(actor, action) {
  requireActor(actor, action);
  if (actor.role !== 'allocator') {
    throw new Error(`${action} requires the liable allocator — Phase 1 does not auto-allocate capital`);
  }
}
