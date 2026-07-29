const FinishTypes = require("../shared/enums/FinishTypes");
const Rules = require("../config/Rules");

class Finish {
    constructor({
        type,
        winnerId,
        round,
        timestamp = new Date()
    }) {
        const validTypes = Object.values(FinishTypes);

        if (!validTypes.includes(type)) {
            throw new Error(
                "O tipo de finalização informado é inválido."
            );
        }

        if (!winnerId || typeof winnerId !== "string") {
            throw new Error(
                "Finish precisa receber um winnerId válido."
            );
        }

        if (!Number.isInteger(round) || round < 1) {
            throw new Error(
                "Finish precisa receber uma rodada válida."
            );
        }

        this.type = type;
        this.winnerId = winnerId;
        this.points = Rules.FINISH_POINTS[type];
        this.round = round;
        this.timestamp = timestamp;
    }
}

module.exports = Finish;