const socket = io();

const elements = {
    connectionStatus:
        document.getElementById("connection-status"),

    player1Name:
        document.getElementById("player1-name"),

    player1Bey:
        document.getElementById("player1-bey"),

    player1Score:
        document.getElementById("player1-score"),

    player2Name:
        document.getElementById("player2-name"),

    player2Bey:
        document.getElementById("player2-bey"),

    player2Score:
        document.getElementById("player2-score"),

    battleStatus:
        document.getElementById("battle-status"),

    battleRound:
        document.getElementById("battle-round"),

    finishMessage:
        document.getElementById("finish-message"),

    winnerMessage:
        document.getElementById("winner-message")
};

socket.on("connect", () => {
    elements.connectionStatus.textContent =
        "Conectado ao servidor";
});

socket.on("disconnect", () => {
    elements.connectionStatus.textContent =
        "Desconectado do servidor";
});

socket.on("state:sync", renderBattle);
socket.on("battle:state", renderBattle);

socket.on("finish:registered", (finish) => {
    elements.finishMessage.textContent =
        `${finish.type.toUpperCase()} FINISH: +${finish.points}`;
});

function renderBattle(battle) {
    if (!battle) {
        return;
    }

    elements.player1Name.textContent =
        battle.player1.name;

    elements.player1Bey.textContent =
        battle.player1.bey.name;

    elements.player1Score.textContent =
        battle.player1.score;

    elements.player2Name.textContent =
        battle.player2.name;

    elements.player2Bey.textContent =
        battle.player2.bey.name;

    elements.player2Score.textContent =
        battle.player2.score;

    elements.battleStatus.textContent =
        battle.status;

    elements.battleRound.textContent =
        battle.round;

    elements.winnerMessage.textContent =
        battle.winner
            ? `${battle.winner.name} venceu!`
            : "";

    if (battle.status === "waiting") {
        elements.finishMessage.textContent = "";
    }
}