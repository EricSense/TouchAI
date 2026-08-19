/**
 * TouchAI SDK — the touch layer for AI agents.
 * Hands, not brain. Any model plugs in to safely act on real systems.
 */

export const VERSION = '0.3.0';

/** Built-in action catalog */
export const ACTIONS = {
  'web.click': {
    description: 'Click an element in a web page or app surface',
    target: 'web',
    params: {
      selector: { type: 'string', description: 'CSS selector or role name', required: true },
      button: { type: 'string', description: 'left | right | middle', required: false },
    },
  },
  'web.type': {
    description: 'Type text into an input or contenteditable',
    target: 'web',
    params: {
      selector: { type: 'string', description: 'CSS selector', required: true },
      text: { type: 'string', description: 'Text to type', required: true },
      clear: { type: 'boolean', description: 'Clear before typing', required: false },
    },
  },
  'web.navigate': {
    description: 'Navigate a web surface to a URL or path',
    target: 'web',
    params: {
      url: { type: 'string', description: 'Absolute or relative URL', required: true },
    },
  },
  'web.submit': {
    description: 'Submit a form',
    target: 'web',
    params: {
      selector: { type: 'string', description: 'Form CSS selector', required: true },
    },
  },
  'web.read': {
    description: 'Read text content from an element (observe before acting)',
    target: 'web',
    params: {
      selector: { type: 'string', description: 'CSS selector', required: true },
    },
  },
  'http.request': {
    description: 'Call an HTTP API',
    target: 'http',
    params: {
      method: { type: 'string', description: 'GET | POST | PUT | PATCH | DELETE', required: true },
      url: { type: 'string', description: 'Request URL', required: true },
      body: { type: 'object', description: 'JSON body', required: false },
      headers: { type: 'object', description: 'Request headers', required: false },
    },
  },
  'device.command': {
    description: 'Send a command to a connected device / IoT / robotics API',
    target: 'device',
    params: {
      deviceId: { type: 'string', description: 'Device identifier', required: true },
      command: { type: 'string', description: 'Command name', required: true },
      args: { type: 'object', description: 'Command arguments', required: false },
    },
  },
  'desktop.key': {
    description: 'Send a key combination to the desktop (requires desktop bridge)',
    target: 'desktop',
    params: {
      keys: { type: 'string', description: 'e.g. Meta+C', required: true },
    },
  },
};

function now() {
  return new Date().toISOString();
}

function id() {
  return `act_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/**
 * @param {object} options
 * @param {string[]} [options.allow] - action names allowed (default: all catalog)
 * @param {string[]} [options.requireConfirm] - actions that need onConfirm approval
 * @param {(action) => Promise<boolean>|boolean} [options.onConfirm]
 * @param {object} [options.adapters] - { web, http, device, desktop }
 * @param {(entry) => void} [options.onAudit]
 */
export function createTouch(options = {}) {
  const allow = new Set(options.allow ?? Object.keys(ACTIONS));
  const requireConfirm = new Set(options.requireConfirm ?? []);
  const adapters = {
    web: options.adapters?.web ?? null,
    http: options.adapters?.http ?? defaultHttpAdapter,
    device: options.adapters?.device ?? defaultDeviceAdapter,
    desktop: options.adapters?.desktop ?? null,
  };
  const history = [];

  function audit(entry) {
    history.unshift(entry);
    if (history.length > 200) history.length = 200;
    options.onAudit?.(entry);
  }

  function assertAllowed(name) {
    if (!ACTIONS[name]) {
      const err = new Error(`Unknown action: ${name}`);
      err.code = 'UNKNOWN_ACTION';
      throw err;
    }
    if (!allow.has(name)) {
      const err = new Error(`Action not permitted: ${name}`);
      err.code = 'DENIED';
      throw err;
    }
  }

  async function maybeConfirm(name, args) {
    if (!requireConfirm.has(name)) return true;
    if (!options.onConfirm) {
      const err = new Error(`Confirmation required for ${name} but no onConfirm handler`);
      err.code = 'CONFIRM_REQUIRED';
      throw err;
    }
    return Boolean(await options.onConfirm({ name, args }));
  }

  /**
   * Execute one action from an agent / LLM tool call.
   * @param {{ name: string, args?: object }} action
   */
  async function act(action) {
    const name = action?.name;
    const args = action?.args ?? {};
    const actionId = id();
    const started = now();

    try {
      assertAllowed(name);
      const ok = await maybeConfirm(name, args);
      if (!ok) {
        const entry = {
          id: actionId,
          name,
          args,
          status: 'rejected',
          started,
          finished: now(),
          error: 'User or policy rejected action',
        };
        audit(entry);
        return entry;
      }

      const meta = ACTIONS[name];
      const adapter = adapters[meta.target];
      if (!adapter) {
        const err = new Error(`No adapter registered for target: ${meta.target}`);
        err.code = 'NO_ADAPTER';
        throw err;
      }

      const result = await adapter(name, args, { id: actionId });
      const entry = {
        id: actionId,
        name,
        args,
        status: 'ok',
        result,
        started,
        finished: now(),
      };
      audit(entry);
      return entry;
    } catch (error) {
      const entry = {
        id: actionId,
        name,
        args,
        status: 'error',
        error: error.message,
        code: error.code,
        started,
        finished: now(),
      };
      audit(entry);
      return entry;
    }
  }

  /** Run many actions in sequence (agent plan). Stops on first hard error if stopOnError. */
  async function actMany(actions, { stopOnError = true } = {}) {
    const out = [];
    for (const a of actions) {
      const entry = await act(a);
      out.push(entry);
      if (stopOnError && entry.status === 'error') break;
    }
    return out;
  }

  /**
   * Tool definitions for LLM function calling (OpenAI / Anthropic shaped).
   */
  function tools(format = 'openai') {
    const list = [...allow].filter((n) => ACTIONS[n]).map((name) => {
      const a = ACTIONS[name];
      const properties = {};
      const required = [];
      for (const [key, spec] of Object.entries(a.params)) {
        properties[key] = { type: spec.type === 'object' ? 'object' : spec.type, description: spec.description };
        if (spec.required) required.push(key);
      }
      return { name, description: a.description, parameters: { type: 'object', properties, required } };
    });

    if (format === 'anthropic') {
      return list.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    // openai tools
    return list.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  /** System prompt fragment: how to use TouchAI as hands */
  function systemPrompt() {
    return [
      'You have TouchAI — the touch layer for real-world actions.',
      'You are the brain; TouchAI is the hands. Do not invent side effects — call tools.',
      'Prefer observe (web.read) before irreversible actions.',
      'Only use permitted tools. Wait for tool results before continuing.',
      `Permitted: ${[...allow].join(', ')}`,
    ].join('\n');
  }

  return {
    version: VERSION,
    product: 'TouchAI',
    tagline: 'The touch layer between any model and any interface',
    actions: () => Object.fromEntries([...allow].filter((n) => ACTIONS[n]).map((n) => [n, ACTIONS[n]])),
    tools,
    systemPrompt,
    act,
    actMany,
    history: () => [...history],
    clearHistory: () => { history.length = 0; },
    allow: [...allow],
    requireConfirm: [...requireConfirm],
  };
}

async function defaultHttpAdapter(name, args) {
  if (name !== 'http.request') throw new Error(`http adapter cannot run ${name}`);
  const method = (args.method || 'GET').toUpperCase();
  const res = await fetch(args.url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(args.headers ?? {}),
    },
    body: args.body != null && method !== 'GET' && method !== 'HEAD'
      ? JSON.stringify(args.body)
      : undefined,
  });
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch { /* keep text */ }
  return { status: res.status, ok: res.ok, data };
}

async function defaultDeviceAdapter(name, args) {
  if (name !== 'device.command') throw new Error(`device adapter cannot run ${name}`);
  // Safe stub — real deployments inject a robotics / IoT bridge
  return {
    simulated: true,
    deviceId: args.deviceId,
    command: args.command,
    args: args.args ?? {},
    message: 'Device bridge not connected — command recorded for dry-run',
  };
}

/** Browser DOM adapter for sandboxed web surfaces */
export function createWebAdapter(root) {
  const scope = typeof root === 'string' ? document.querySelector(root) : root;
  if (!scope) throw new Error('web adapter root not found');

  function el(selector) {
    const node = scope.querySelector(selector);
    if (!node) {
      const err = new Error(`Element not found: ${selector}`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    return node;
  }

  return async function webAdapter(name, args) {
    switch (name) {
      case 'web.click': {
        const node = el(args.selector);
        node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        if (typeof node.click === 'function') node.click();
        return { selector: args.selector, tag: node.tagName.toLowerCase() };
      }
      case 'web.type': {
        const node = el(args.selector);
        if (args.clear) {
          if ('value' in node) node.value = '';
          else node.textContent = '';
        }
        if ('value' in node) {
          node.value = `${node.value ?? ''}${args.text ?? ''}`;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          node.textContent = `${node.textContent ?? ''}${args.text ?? ''}`;
        }
        return { selector: args.selector, text: args.text };
      }
      case 'web.navigate': {
        // Sandbox: update data attribute / hash inside demo world, never leave host unless absolute allowed
        const url = args.url;
        scope.dispatchEvent(new CustomEvent('touchai:navigate', { detail: { url }, bubbles: true }));
        const route = scope.querySelector('[data-route]');
        if (route) route.setAttribute('data-route', url);
        const label = scope.querySelector('[data-route-label]');
        if (label) label.textContent = url;
        return { url };
      }
      case 'web.submit': {
        const form = el(args.selector);
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        return { selector: args.selector };
      }
      case 'web.read': {
        const node = el(args.selector);
        const text = ('value' in node ? node.value : node.textContent)?.trim() ?? '';
        return { selector: args.selector, text };
      }
      default:
        throw new Error(`web adapter cannot run ${name}`);
    }
  };
}

export { createTouch as default };
