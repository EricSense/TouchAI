/**
 * TouchAI Device — persistent situated profile that compounds over time.
 */

const KEY = 'touchai-device-profile-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? emptyProfile();
  } catch {
    return emptyProfile();
  }
}

function save(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

function emptyProfile() {
  return {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 0,
    totalQueries: 0,
    preferredModel: null,
    machines: {},
    recentPatterns: [],
  };
}

function machineKey(hw) {
  return `${hw.platform}|${hw.arch}|${hw.cores ?? '?'}`;
}

/** Record a visit / hardware sighting for the Situated Agent */
export function recordDeviceVisit(hw) {
  const profile = load();
  const key = machineKey(hw);
  const now = Date.now();

  profile.visits += 1;
  profile.updatedAt = now;

  const machine = profile.machines[key] ?? {
    key,
    platform: hw.platform,
    arch: hw.arch,
    cores: hw.cores,
    formFactor: hw.formFactor,
    firstSeen: now,
    lastSeen: now,
    sightings: 0,
    lastLayers: null,
  };

  machine.sightings += 1;
  machine.lastSeen = now;
  machine.formFactor = hw.formFactor;
  machine.lastLayers = (hw.layers ?? []).map((l) => ({ name: l.name, summary: l.summary }));
  machine.npu = hw.npu;
  machine.gpu = hw.gpu;
  profile.machines[key] = machine;

  save(profile);
  return profile;
}

export function recordDeviceQuery(hw, modelId, latencyMs) {
  const profile = load();
  const key = machineKey(hw);
  profile.totalQueries += 1;
  profile.preferredModel = modelId;
  profile.updatedAt = Date.now();
  profile.recentPatterns.unshift({
    at: Date.now(),
    modelId,
    latencyMs: Math.round(latencyMs),
    machine: key,
  });
  if (profile.recentPatterns.length > 40) profile.recentPatterns = profile.recentPatterns.slice(0, 40);
  save(profile);
  return profile;
}

export function getDeviceProfile() {
  return load();
}

export function getMachineMemory(hw) {
  const profile = load();
  return profile.machines[machineKey(hw)] ?? null;
}

export function situatedSummary(hw) {
  const profile = load();
  const machine = profile.machines[machineKey(hw)];
  if (!machine) {
    return {
      status: 'first contact',
      line: 'Situated Agent meeting this machine for the first time.',
      visits: profile.visits,
      queries: profile.totalQueries,
    };
  }

  const days = Math.max(1, Math.round((Date.now() - machine.firstSeen) / 86400000));
  return {
    status: 'known machine',
    line: `${machine.sightings} sightings over ${days} day${days === 1 ? '' : 's'} · ${profile.totalQueries} queries on-device`,
    visits: profile.visits,
    queries: profile.totalQueries,
    preferredModel: profile.preferredModel,
    sightings: machine.sightings,
    firstSeen: machine.firstSeen,
    days,
  };
}
