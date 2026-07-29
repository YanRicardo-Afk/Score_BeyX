const EventBus = require("./EventBus");
const Events = require("../shared/Events");

class Engine {
    constructor() {
        this.eventBus = new EventBus();
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        this.eventBus.emit(Events.BATTLE_UPDATED, {
            message: "Engine inicializada."
        });
    }

    dispatch(command) {
        if (!this.initialized) {
            throw new Error(
                "A Engine precisa ser inicializada antes de receber comandos."
            );
        }

        if (!command || typeof command !== "object") {
            throw new TypeError("O comando precisa ser um objeto.");
        }

        if (!command.type) {
            throw new Error("O comando precisa possuir a propriedade type.");
        }

        this.eventBus.emit(Events.COMMAND_RECEIVED, command);
    }

    on(eventName, callback) {
        return this.eventBus.on(eventName, callback);
    }

    once(eventName, callback) {
        return this.eventBus.once(eventName, callback);
    }

    off(eventName, callback) {
        return this.eventBus.off(eventName, callback);
    }

    emit(eventName, payload) {
        this.eventBus.emit(eventName, payload);
    }
}

module.exports = Engine;