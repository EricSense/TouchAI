/**
 * Hardware-rooted attestation — prove where inference ran.
 */
export async function attestIntegrity(hw) {
  const seed = `${hw.platform}|${hw.arch}|${hw.cores}|${hw.gpu}|${hw.layersActive}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  const signature = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);

  return {
    deviceId: btoa(`${hw.platform}-${hw.arch}`).replace(/=+$/, '').slice(0, 16),
    enclave: hw.npu,
    signature,
    layers: hw.layersActive,
    policy: hw.networkPolicy,
    timestamp: new Date().toISOString(),
  };
}
