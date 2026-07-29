const Bey = require("./src/domain/Bey");
const Player = require("./src/domain/Player");
const Battle = require("./src/domain/Battle");
const Finish = require("./src/domain/Finish");
const FinishTypes = require("./src/shared/enums/FinishTypes");


const dranSword = new Bey({
    id: "dran-sword",
    name: "Dran Sword",
    color: "#2F80ED"
});

const wizardArrow = new Bey({
    id: "wizard-arrow",
    name: "Wizard Arrow",
    color: "#F2C94C"
});

const yan = new Player({
    id: "player-1",
    name: "Yan",
    bey: dranSword
});

const pedro = new Player({
    id: "player-2",
    name: "Pedro",
    bey: wizardArrow
});

const battle = new Battle({
    id: "battle-1",
    player1: yan,
    player2: pedro
});

battle.start();

const firstFinish = new Finish({
    type: FinishTypes.BURST,
    winnerId: yan.id,
    round: battle.round
});

battle.registerFinish(firstFinish);

console.log("\nDepois da primeira rodada:");
console.log("Placar Yan:", battle.player1Score);
console.log("Status:", battle.status);
console.log("Rodada:", battle.round);

const secondFinish = new Finish({
    type: FinishTypes.BURST,
    winnerId: yan.id,
    round: battle.round
});

battle.registerFinish(secondFinish);

console.log("\nDepois da segunda rodada:");
console.log("Placar Yan:", battle.player1Score);
console.log("Status:", battle.status);
console.log("Vencedor:", battle.winner.name);
console.log("Rodada:", battle.round);
console.log("Histórico:", battle.history.length);

