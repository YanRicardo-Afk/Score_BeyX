class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(eventName, callback) {
        if (typeof callback !== "function") {
            throw new TypeError("O listener precisa ser uma função.");
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }

        this.listeners.get(eventName).add(callback);

        return () => this.off(eventName, callback);
    }

    once(eventName, callback) {
        const unsubscribe = this.on(eventName, (payload) => {
            unsubscribe();
            callback(payload);
        });

        return unsubscribe;
    }

    off(eventName, callback) {
        const eventListeners = this.listeners.get(eventName);

        if (!eventListeners) {
            return false;
        }

        const removed = eventListeners.delete(callback);

        if (eventListeners.size === 0) {
            this.listeners.delete(eventName);
        }

        return removed;
    }

    emit(eventName, payload = {}) {
        const eventListeners = this.listeners.get(eventName);

        if (!eventListeners) {
            return;
        }

        for (const callback of [...eventListeners]) {
            try {
                callback(payload);
            } catch (error) {
                console.error(
                    `Erro ao executar listener do evento "${eventName}":`,
                    error
                );
            }
        }
    }

    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
            return;
        }

        this.listeners.clear();
    }
}

module.exports = EventBus;