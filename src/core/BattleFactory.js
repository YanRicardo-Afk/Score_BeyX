const Deck = require("../domain/Deck");
const Player = require("../domain/Player");

class BattleFactory {
    constructor({
        beyCatalog
    } = {}) {
        if (!beyCatalog) {
            throw new Error(
                "BattleFactory precisa receber um BeyCatalog."
            );
        }

        this.beyCatalog = beyCatalog;
    }

    create({
        id,
        player1,
        player2
    }) {
        this.validateBattleId(id);

        return {
            id: id.trim(),

            player1: this.createPlayer({
                playerId: "player-1",
                playerData: player1
            }),

            player2: this.createPlayer({
                playerId: "player-2",
                playerData: player2
            })
        };
    }

    createPlayer({
        playerId,
        playerData
    }) {
        if (!playerData) {
            throw new Error(
                `Os dados de ${playerId} são obrigatórios.`
            );
        }

        const {
            name,
            deck: deckIds
        } = playerData;

        this.validatePlayerName(
            name,
            playerId
        );

        const beys = this.resolveBeys(
            deckIds,
            playerId
        );

        const deck = new Deck({
            slots: beys
        });

        return new Player({
            id: playerId,
            name: name.trim(),
            deck
        });
    }

    resolveBeys(
        deckIds,
        playerId
    ) {
        if (!Array.isArray(deckIds)) {
            throw new Error(
                `O Deck de ${playerId} precisa ser uma lista.`
            );
        }

        if (deckIds.length === 0) {
            throw new Error(
                `O Deck de ${playerId} precisa possuir pelo menos um Bey.`
            );
        }

        if (deckIds.length > 3) {
            throw new Error(
                `O Deck de ${playerId} pode possuir no máximo 3 Beys.`
            );
        }

        return deckIds.map((beyId) => {
            if (
                typeof beyId !== "string" ||
                beyId.trim() === ""
            ) {
                throw new Error(
                    `O Deck de ${playerId} contém um ID inválido.`
                );
            }

            const normalizedId =
                beyId.trim();

            const bey =
                this.beyCatalog.getById(
                    normalizedId
                );

            if (!bey) {
                throw new Error(
                    `O Bey "${normalizedId}" não existe no catálogo.`
                );
            }

            return bey;
        });
    }

    validateBattleId(id) {
        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            throw new Error(
                "A batalha precisa receber um ID válido."
            );
        }
    }

    validatePlayerName(
        name,
        playerId
    ) {
        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            throw new Error(
                `${playerId} precisa receber um nome válido.`
            );
        }
    }
}

module.exports = BattleFactory;