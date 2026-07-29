const Player = require("./Player");
const Finish = require("./Finish");
const BattleStatus = require("../shared/enums/BattleStatus");
const Rules = require("../config/Rules");

class Battle {
    constructor({
        id,
        player1,
        player2
    }) {
        if (!id || typeof id !== "string") {
            throw new Error("Battle precisa receber um id válido.");
        }

        if (!(player1 instanceof Player)) {
            throw new Error(
                "Battle precisa receber uma instância de Player como player1."
            );
        }

        if (!(player2 instanceof Player)) {
            throw new Error(
                "Battle precisa receber uma instância de Player como player2."
            );
        }

        if (player1.id === player2.id) {
            throw new Error(
                "Uma batalha precisa possuir dois jogadores diferentes."
            );
        }

        this.id = id;

        this.player1 = player1;
        this.player2 = player2;

        this.player1Score = 0;
        this.player2Score = 0;

        this.round = 1;
        this.history = [];

        this.winner = null;
        this.status = BattleStatus.WAITING;
    }

    start() {
        if (this.status !== BattleStatus.WAITING) {
            throw new Error(
                "A batalha só pode ser iniciada quando estiver aguardando."
            );
        }

        this.status = BattleStatus.RUNNING;
    }

    registerFinish(finish) {
    if (this.status !== BattleStatus.RUNNING) {
        throw new Error(
            "Só é possível registrar uma finalização durante uma batalha em andamento."
        );
    }

    if (!(finish instanceof Finish)) {
        throw new Error(
            "A batalha precisa receber uma instância de Finish."
        );
    }

    const winner = this.getPlayerById(finish.winnerId);

    if (!winner) {
        throw new Error(
            "O vencedor da finalização não participa desta batalha."
        );
    }

    if (finish.round !== this.round) {
        throw new Error(
            "A rodada da finalização não corresponde à rodada atual."
        );
    }

    this.addPoints(winner, finish.points);

    this.history.push(finish);

    if (this.hasWinner(winner)) {
        this.finish(winner);
        return;
    }

    this.round += 1;
}
    getPlayerById(playerId) {
    if (this.player1.id === playerId) {
        return this.player1;
    }

    if (this.player2.id === playerId) {
        return this.player2;
    }

    return null;
}

    addPoints(player, points) {
    if (player === this.player1) {
        this.player1Score += points;
        return;
    }

    if (player === this.player2) {
        this.player2Score += points;
        return;
    }

    throw new Error(
        "Não é possível adicionar pontos a um jogador que não participa da batalha."
    );
}

    finish(winner) {
        if (this.status !== BattleStatus.RUNNING) {
            throw new Error(
                "A batalha só pode ser finalizada quando estiver em andamento."
            );
        }

        if (
            winner !== this.player1 &&
            winner !== this.player2
        ) {
            throw new Error(
                "O vencedor precisa ser um dos jogadores da batalha."
            );
        }

        this.winner = winner;
        this.status = BattleStatus.FINISHED;
    }

    reset() {
        this.player1Score = 0;
        this.player2Score = 0;

        this.round = 1;
        this.history = [];

        this.winner = null;
        this.status = BattleStatus.WAITING;
    }
    hasWinner(player) {
    if (player === this.player1) {
        return this.player1Score >= Rules.WIN_SCORE;
    }

    if (player === this.player2) {
        return this.player2Score >= Rules.WIN_SCORE;
    }

    return false;
}
}

module.exports = Battle;


