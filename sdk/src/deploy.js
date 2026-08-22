/**
 * Deploy anywhere, anytime.
 * TouchAI situates on any host — browser, Node, container, or static CDN.
 */

import { runtimeId, isBrowser, isNode } from './env.js';
import { SDK_VERSION } from './layers.js';

/** Portable targets where TouchAI can ship today */
export const DEPLOY_TARGETS = [
  {
    id: 'static',
    name: 'Static hosting',
    anytime: true,
    command: 'npm run build && npm start',
    notes: 'Dist folder works on any static CDN or object store.',
  },
  {
    id: 'docker',
    name: 'Docker',
    anytime: true,
    command: 'docker compose up --build',
    notes: 'Same image on laptop, VM, or any container host.',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    anytime: true,
    command: 'vercel --prod',
    notes: 'vite build → dist. Already configured via vercel.json.',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    anytime: true,
    command: 'netlify deploy --prod --dir=dist',
    notes: 'Configured via netlify.toml.',
  },
  {
    id: 'render',
    name: 'Render',
    anytime: true,
    command: 'render blueprint apply',
    notes: 'Static site from render.yaml.',
  },
  {
    id: 'fly',
    name: 'Fly.io',
    anytime: true,
    command: 'fly deploy',
    notes: 'Container deploy via Dockerfile + fly.toml.',
  },
  {
    id: 'node',
    name: 'Any Node host',
    anytime: true,
    command: 'npm run build && npm start',
    notes: 'Zero-dep static server on PORT (default 4173).',
  },
  {
    id: 'sdk',
    name: 'Embed SDK',
    anytime: true,
    command: 'npm install ./sdk',
    notes: 'createTouchAI() binds to whatever host is running the code.',
  },
];

/**
 * Manifest describing how TouchAI deploys on the current runtime
 * and every supported target.
 */
export function deployManifest(hw = null, plan = null) {
  return {
    product: 'TouchAI',
    version: SDK_VERSION,
    thesis: 'Hardware-aware AI — deploy on any host, anytime',
    pipeline: ['scan', 'adapt', 'route', 'run', 'remember'],
    runtime: {
      id: runtimeId(),
      browser: isBrowser(),
      node: isNode(),
      host: hw
        ? {
            platform: hw.platform,
            arch: hw.arch,
            cores: hw.cores,
            path: plan ? `${plan.device}/${plan.dtype}` : null,
          }
        : null,
    },
    anywhere: true,
    anytime: true,
    targets: DEPLOY_TARGETS,
  };
}

/** One-liner helpers for docs / UI */
export function deployCommands() {
  return Object.fromEntries(DEPLOY_TARGETS.map((t) => [t.id, t.command]));
}
