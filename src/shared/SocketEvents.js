const SocketEvents = Object.freeze({
    STATE_SYNC: "state:sync",
    BATTLE_STATE: "battle:state",
    FINISH_REGISTERED: "finish:registered",

    COMMAND_START_BATTLE: "command:battle:start",
    COMMAND_RESET_BATTLE: "command:battle:reset",
    COMMAND_REGISTER_FINISH: "command:finish:register",

    COMMAND_SUCCESS: "command:success",
    COMMAND_ERROR: "command:error"
});

module.exports = SocketEvents;