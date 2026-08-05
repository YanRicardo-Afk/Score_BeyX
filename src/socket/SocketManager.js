const { Server } = require("socket.io");

const Events = require("../shared/Events");
const SocketEvents = require("../shared/SocketEvents");

class SocketManager {
    constructor({
        httpServer,
        eventBus,
        battleManager
    }) {
        if (!httpServer) {
            throw new Error(
                "SocketManager precisa receber um servidor HTTP."
            );
        }

        if (!eventBus) {
            throw new Error(
                "SocketManager precisa receber um EventBus."
            );
        }

        if (!battleManager) {
            throw new Error(
                "SocketManager precisa receber um BattleManager."
            );
        }

        this.eventBus = eventBus;
        this.battleManager = battleManager;
        this.io = new Server(httpServer);

        this.registerEventForwarding();
        this.registerConnections();
    }

    registerConnections() {
        this.io.on("connection", (socket) => {
            this.emitCurrentState(socket);

            socket.on(
                SocketEvents.COMMAND_START_BATTLE,
                (payload, acknowledge) => {
                    this.executeCommand({
                        socket,
                        acknowledge,
                        action: () => {
                            this.battleManager.startBattle();

                            return {
                                message: "Batalha iniciada."
                            };
                        }
                    });
                }
            );

            socket.on(
                SocketEvents.COMMAND_RESET_BATTLE,
                (payload, acknowledge) => {
                    this.executeCommand({
                        socket,
                        acknowledge,
                        action: () => {
                            this.battleManager.resetBattle();

                            return {
                                message: "Batalha reiniciada."
                            };
                        }
                    });
                }
            );

            socket.on(
                SocketEvents.COMMAND_REGISTER_FINISH,
                (payload, acknowledge) => {
                    this.executeCommand({
                        socket,
                        acknowledge,
                        action: () => {
                            const finish =
                                this.battleManager.registerFinish({
                                    type: payload?.type,
                                    winnerId: payload?.winnerId
                                });

                            return {
                                message: "Finalização registrada.",
                                finish: this.serializeFinish(finish)
                            };
                        }
                    });
                }
            );
        });
    }

    registerEventForwarding() {
        const stateEvents = [
            Events.BATTLE_CREATED,
            Events.BATTLE_STARTED,
            Events.BATTLE_UPDATED,
            Events.BATTLE_RESET,
            Events.BATTLE_FINISHED
        ];

        stateEvents.forEach((eventName) => {
            this.eventBus.on(eventName, (battle) => {
                this.io.emit(
                    SocketEvents.BATTLE_STATE,
                    this.serializeBattle(battle)
                );
            });
        });

        this.eventBus.on(
            Events.FINISH_REGISTERED,
            (finish) => {
                this.io.emit(
                    SocketEvents.FINISH_REGISTERED,
                    this.serializeFinish(finish)
                );
            }
        );
    }

    executeCommand({
        socket,
        acknowledge,
        action
    }) {
        try {
            const result = action();

            const response = {
                ok: true,
                ...result
            };

            if (typeof acknowledge === "function") {
                acknowledge(response);
            }

            socket.emit(
                SocketEvents.COMMAND_SUCCESS,
                response
            );
        } catch (error) {
            const response = {
                ok: false,
                message: error.message
            };

            if (typeof acknowledge === "function") {
                acknowledge(response);
            }

            socket.emit(
                SocketEvents.COMMAND_ERROR,
                response
            );
        }
    }

    emitCurrentState(socket) {
        const battle =
            this.battleManager.getCurrentBattle();

        socket.emit(
            SocketEvents.STATE_SYNC,
            this.serializeBattle(battle)
        );
    }

    serializeBattle(battle) {
        if (!battle) {
            return null;
        }

        return {
            id: battle.id,
            status: battle.status,
            round: battle.round,

            player1: this.serializePlayer(
                battle.player1,
                battle.player1Score
            ),

            player2: this.serializePlayer(
                battle.player2,
                battle.player2Score
            ),

            winner: battle.winner
                ? this.serializePlayer(
                    battle.winner,
                    battle.getScore(battle.winner)
                )
                : null,

            history: battle.history.map((finish) =>
                this.serializeFinish(finish)
            )
        };
    }

    serializePlayer(player, score) {
    const activeBey = player.activeBey;

    return {
        id: player.id,
        name: player.name,
        score,

        bey: {
            id: activeBey.id,
            name: activeBey.name,

            color:
                activeBey.theme?.primary ??
                "#72E9FF",

            image:
                activeBey.avatar ??
                null,

            generation:
                activeBey.generation,

            series:
                activeBey.series,

            theme:
                activeBey.theme
        }
    };
}

    serializeFinish(finish) {
        return {
            type: finish.type,
            winnerId: finish.winnerId,
            points: finish.points,
            round: finish.round,
            timestamp: finish.timestamp
        };
    }

    close() {
        return new Promise((resolve) => {
            this.io.close(() => resolve());
        });
    }
}

module.exports = SocketManager;