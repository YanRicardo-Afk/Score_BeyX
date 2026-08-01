const socket = io();

const connectionStatus =
    document.getElementById("connection-status");

const commandFeedback =
    document.getElementById("command-feedback");

const startButton =
    document.getElementById("start-battle");

const resetButton =
    document.getElementById("reset-battle");

const finishButtons =
    document.querySelectorAll("[data-finish]");

socket.on("connect", () => {
    connectionStatus.textContent =
        "Conectado ao servidor";
});

socket.on("disconnect", () => {
    connectionStatus.textContent =
        "Desconectado do servidor";
});

socket.on("command:error", (response) => {
    commandFeedback.textContent =
        response.message;
});

startButton.addEventListener("click", () => {
    sendCommand(
        "command:battle:start",
        {}
    );
});

resetButton.addEventListener("click", () => {
    sendCommand(
        "command:battle:reset",
        {}
    );
});

finishButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const winnerInput =
            document.querySelector(
                'input[name="winner"]:checked'
            );

        sendCommand(
            "command:finish:register",
            {
                type: button.dataset.finish,
                winnerId: winnerInput.value
            }
        );
    });
});

function sendCommand(eventName, payload) {
    socket.emit(
        eventName,
        payload,
        (response) => {
            commandFeedback.textContent =
                response.message;
        }
    );
}