const express = require("express");

function createApiRouter({
    beyCatalog,
    battleFactory,
    battleManager
} = {}) {
    if (!beyCatalog) {
        throw new Error(
            "A API precisa receber um BeyCatalog."
        );
    }

    if (!battleFactory) {
        throw new Error(
            "A API precisa receber um BattleFactory."
        );
    }

    if (!battleManager) {
        throw new Error(
            "A API precisa receber um BattleManager."
        );
    }

    const router = express.Router();

    router.get(
        "/beys",
        (request, response) => {
            const beys =
                beyCatalog.getAll();

            response.json({
                count: beys.length,
                beys
            });
        }
    );

    router.post(
        "/battle",
        (request, response) => {
            try {
                const {
                    id,
                    player1,
                    player2
                } = request.body;

                const battleId =
                    typeof id === "string" &&
                    id.trim() !== ""
                        ? id.trim()
                        : `battle-${Date.now()}`;

                /*
                    Primeiro validamos e montamos os dados.

                    A batalha atual só será removida
                    depois que o Factory confirmar
                    que a nova configuração é válida.
                */
                const battleData =
                    battleFactory.create({
                        id: battleId,
                        player1,
                        player2
                    });

                if (
                    battleManager
                        .hasCurrentBattle()
                ) {
                    battleManager
                        .removeBattle();
                }

                const battle =
                    battleManager.createBattle(
                        battleData
                    );

                response.status(201).json({
                    message:
                        "Batalha configurada com sucesso.",

                    battle:
                        serializeBattleSetup(
                            battle
                        )
                });
            } catch (error) {
                response.status(400).json({
                    error: error.message
                });
            }
        }
    );

    return router;
}

function serializeBattleSetup(battle) {
    return {
        id: battle.id,
        status: battle.status,
        round: battle.round,

        player1:
            serializePlayer(
                battle.player1
            ),

        player2:
            serializePlayer(
                battle.player2
            )
    };
}

function serializePlayer(player) {
    return {
        id: player.id,
        name: player.name,

        deck: player.deck
            .getAll()
            .map((bey) => ({
                id: bey.id,
                name: bey.name,
                avatar: bey.avatar,
                theme: bey.theme
            })),

        activeBey: {
            id: player.activeBey.id,
            name: player.activeBey.name,
            avatar:
                player.activeBey.avatar,
            theme:
                player.activeBey.theme
        }
    };
}

module.exports = createApiRouter;