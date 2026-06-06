export class MemoryStore {
  constructor() {
    this.entries = [];
    this.history = [];
    this.onUpdate = null;
  }

  addQuery(text) {
    const entry = {
      id: crypto.randomUUID(),
      text,
      time: new Date(),
    };
    this.entries.unshift(entry);
    this.onUpdate?.();
    return entry;
  }

  addTurn(role, content) {
    this.history.push({ role, content });
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
      text.textContent = entry.text.length > 80 ? entry.text.slice(0, 80) + '…' : entry.text;

      li.appendChild(time);
      li.appendChild(text);
      container.appendChild(li);
    }
  }
}
