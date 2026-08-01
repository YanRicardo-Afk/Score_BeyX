const Battle = require("../domain/Battle");
const Finish = require("../domain/Finish");

const Events = require("../shared/Events");

class BattleManager {
    constructor({ eventBus } = {}) {
        if (!eventBus) {
            throw new Error(
                "BattleManager precisa receber uma instância de EventBus."
            );
        }

        this.eventBus = eventBus;
        this.currentBattle = null;
    }

    createBattle({ id, player1, player2 }) {
        if (this.currentBattle) {
            throw new Error(
                "Já existe uma batalha ativa no BattleManager."
            );
        }

        this.currentBattle = new Battle({
            id,
            player1,
            player2
        });

        this.eventBus.emit(
            Events.BATTLE_CREATED,
            this.currentBattle
        );

        return this.currentBattle;
    }

    getCurrentBattle() {
        return this.currentBattle;
    }

    hasCurrentBattle() {
        return this.currentBattle !== null;
    }

    startBattle() {
        const battle = this.requireCurrentBattle();

        battle.start();

        this.eventBus.emit(
            Events.BATTLE_STARTED,
            battle
        );

        return battle;
    }
    registerFinish({
    type,
    winnerId
}) {

    const battle = this.requireCurrentBattle();

    const finish = new Finish({
        type,
        winnerId,
        round: battle.round
    });

    battle.registerFinish(finish);

    this.eventBus.emit(
        Events.FINISH_REGISTERED,
        finish
    );

    this.eventBus.emit(
        Events.BATTLE_UPDATED,
        battle
    );

    if (battle.status === "finished") {

        this.eventBus.emit(
            Events.BATTLE_FINISHED,
            battle
        );

    }

    return finish;

}

    resetBattle() {
        const battle = this.requireCurrentBattle();

        battle.reset();

        this.eventBus.emit(
            Events.BATTLE_RESET,
            battle
        );

        return battle;
    }

    removeBattle() {
        const battle = this.requireCurrentBattle();

        this.currentBattle = null;

        this.eventBus.emit(
            Events.BATTLE_REMOVED,
            battle
        );

        return battle;
    }

    requireCurrentBattle() {
        if (!this.currentBattle) {
            throw new Error(
                "Nenhuma batalha foi criada no BattleManager."
            );
        }

        return this.currentBattle;
    }
}

module.exports = BattleManager;