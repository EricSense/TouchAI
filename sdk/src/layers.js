/** Eight layers of situational awareness — SDK constant */
export const HARDWARE_LAYERS = [
  { layer: 'Silicon', knows: 'Chip architecture, cores, instruction sets, GPU/NPU availability' },
  { layer: 'Thermal', knows: 'Temperature state, throttling thresholds, cooling headroom' },
  { layer: 'Power', knows: 'Battery level, charge state, power draw budget' },
  { layer: 'Memory', knows: 'RAM available, bandwidth, cache topology' },
  { layer: 'Sensors', knows: 'Camera, mic, GPS, accelerometer, biometrics — present and active' },
  { layer: 'Peripherals', knows: "What's connected, what can extend capability" },
  { layer: 'History', knows: 'Performance fingerprint of this specific machine over time' },
  { layer: 'User', knows: 'Workload rhythms, usage patterns, behavioral signatures' },
];

export const SDK_VERSION = '0.4.0';
