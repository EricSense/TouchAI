import { OUTCOME_SOURCES } from './constants.js';
import { makeId, money } from './ids.js';
import { digestPayload } from './hash.js';

export { digestPayload };

export function attestationPayload({
  ventureId,
  type,
  quantity,
  unitValue,
  source,
  occurredAt,
  nonce,
}) {
  return {
    ventureId,
    type,
    quantity: money(quantity),
    unitValue: money(unitValue),
    source,
    occurredAt,
    nonce,
  };
}

export async function attestOutcome(event) {
  if (!OUTCOME_SOURCES.includes(event.source)) {
    throw new Error(`Outcome source '${event.source}' is not a live-verifiable channel`);
  }
  const nonce = event.nonce || makeId('nce');
  const payload = attestationPayload({ ...event, nonce });
  const hash = await digestPayload(payload);
  return { payload, hash, nonce };
}

export async function verifyAttestation(attestation) {
  const expected = await digestPayload(attestation.payload);
  return {
    ok: expected === attestation.hash,
    expected,
    hash: attestation.hash,
  };
}
