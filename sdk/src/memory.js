/**
 * Persistent conversation memory for TouchAI Device (Situated Agent).
 */

const KEY = 'touchai-device-memory-v1';

function loadRaw() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { entries: [], history: [] };
  } catch {
    return { entries: [], history: [] };
  }
}

function saveRaw(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export class MemoryStore {
  constructor({ persist = true } = {}) {
    this.persist = persist;
    const raw = persist ? loadRaw() : { entries: [], history: [] };
    this.entries = (raw.entries ?? []).map((e) => ({ ...e, time: new Date(e.time) }));
    this.history = raw.history ?? [];
    this.onUpdate = null;
  }

  _flush() {
    if (!this.persist) return;
    saveRaw({
      entries: this.entries.slice(0, 50).map((e) => ({
        id: e.id,
        text: e.text,
        time: e.time instanceof Date ? e.time.toISOString() : e.time,
      })),
      history: this.history.slice(-40),
    });
  }

  addQuery(text) {
    const entry = {
      id: crypto.randomUUID(),
      text,
      time: new Date(),
    };
    this.entries.unshift(entry);
    if (this.entries.length > 50) this.entries = this.entries.slice(0, 50);
    this._flush();
    this.onUpdate?.();
    return entry;
  }

  addTurn(role, content) {
    this.history.push({ role, content });
    if (this.history.length > 40) this.history = this.history.slice(-40);
    this._flush();
  }

  getConversationHistory() {
    return [...this.history];
  }

  recall(id) {
    const entry = this.entries.find((e) => e.id === id);
    return entry?.text ?? null;
  }

  clear() {
    this.entries = [];
    this.history = [];
    this._flush();
    this.onUpdate?.();
  }

  render(container, emptyEl) {
    container.innerHTML = '';
    if (!this.entries.length) {
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    for (const entry of this.entries) {
      const li = document.createElement('li');
      li.className = 'memory-item interactive';
      li.dataset.id = entry.id;

      const time = document.createElement('div');
      time.className = 'mem-time';
      time.textContent = entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const text = document.createElement('div');
      text.textContent = entry.text.length > 80 ? `${entry.text.slice(0, 80)}…` : entry.text;

      li.appendChild(time);
      li.appendChild(text);
      container.appendChild(li);
    }
  }
}
