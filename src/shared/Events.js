const Events = Object.freeze({
    APP_STARTED: "app:started",
    APP_STOPPED: "app:stopped",

    BATTLE_CREATED: "battle:created",
    BATTLE_STARTED: "battle:started",
    BATTLE_RESET: "battle:reset",
    BATTLE_REMOVED: "battle:removed",
    BATTLE_UPDATED: "battle:updated",
    BATTLE_FINISHED: "battle:finished",

    FINISH_REGISTERED: "finish:registered",

    CLIENT_CONNECTED: "client:connected",
    CLIENT_DISCONNECTED: "client:disconnected"
});

module.exports = Events;