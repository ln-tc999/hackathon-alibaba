// Simple event emitter for session updates
type SessionEventListener = () => void;

class SessionEventEmitter {
  private listeners: SessionEventListener[] = [];

  subscribe(listener: SessionEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const sessionEvents = new SessionEventEmitter();
