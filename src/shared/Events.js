const Events = Object.freeze({
    COMMAND_RECEIVED: "command:received",

    BATTLE_STARTED: "battle:started",
    BATTLE_RESET: "battle:reset",
    BATTLE_UPDATED: "battle:updated",
    BATTLE_FINISHED: "battle:finished",

    FINISH_REGISTERED: "finish:registered",

    SCORE_UPDATED: "score:updated",

    PLAYER_VICTORY: "player:victory",

    CLIENT_CONNECTED: "client:connected",
    CLIENT_DISCONNECTED: "client:disconnected"
});

module.exports = Events;