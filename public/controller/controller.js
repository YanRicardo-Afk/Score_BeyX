const socket = io();
const MAX_DECK_SIZE = 1;

const state = {
    beys: [],
    player1Deck: [],
    player2Deck: [],
    creatingBattle: false
};

const elements = {
    connectionStatus: document.getElementById("connection-status"),
    connectionIndicator: document.getElementById("connection-indicator"),
    commandFeedback: document.getElementById("command-feedback"),
    player1Name: document.getElementById("player1-name"),
    player2Name: document.getElementById("player2-name"),
    player1BeyList: document.getElementById("player1-bey-list"),
    player2BeyList: document.getElementById("player2-bey-list"),
    player1SelectionCount: document.getElementById("player1-selection-count"),
    player2SelectionCount: document.getElementById("player2-selection-count"),
    createBattleButton: document.getElementById("create-battle"),
    startButton: document.getElementById("start-battle"),
    resetButton: document.getElementById("reset-battle"),
    finishButtons: document.querySelectorAll("[data-finish]"),
    beyCardTemplate: document.getElementById("bey-card-template")
};

initializeController();

async function initializeController() {
    configureSocket();
    configureEvents();
    await loadBeys();
}

function configureSocket() {
    socket.on("connect", () => {
        elements.connectionStatus.textContent = "Conectado ao servidor";
        elements.connectionIndicator.classList.add("is-connected");
    });

    socket.on("disconnect", () => {
        elements.connectionStatus.textContent = "Desconectado do servidor";
        elements.connectionIndicator.classList.remove("is-connected");
    });

    socket.on("command:error", (response) => {
        showFeedback(response.message, "error");
    });
}

function configureEvents() {
    elements.createBattleButton.addEventListener("click", createBattle);

    elements.startButton.addEventListener("click", () => {
        sendCommand("command:battle:start", {});
    });

    elements.resetButton.addEventListener("click", () => {
        sendCommand("command:battle:reset", {});
    });

    elements.finishButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const winnerInput = document.querySelector('input[name="winner"]:checked');

            if (!winnerInput) {
                showFeedback("Selecione o vencedor da rodada.", "error");
                return;
            }

            sendCommand("command:finish:register", {
                type: button.dataset.finish,
                winnerId: winnerInput.value
            });
        });
    });

    elements.player1Name.addEventListener("input", updateCreateButton);
    elements.player2Name.addEventListener("input", updateCreateButton);
}

async function loadBeys() {
    try {
        showFeedback("Carregando catálogo...", "neutral");

        const response = await fetch("/api/beys");

        if (!response.ok) {
            throw new Error("Não foi possível carregar o catálogo.");
        }

        const data = await response.json();
        state.beys = data.beys;

        renderBeyLists();
        showFeedback(`${data.count} Beys carregados.`, "success");
    } catch (error) {
        console.error(error);
        showFeedback(error.message, "error");
    }
}

function renderBeyLists() {
    renderBeyList({ container: elements.player1BeyList, playerKey: "player1" });
    renderBeyList({ container: elements.player2BeyList, playerKey: "player2" });
    updateSelectionInterface();
}

function renderBeyList({ container, playerKey }) {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    state.beys.forEach((bey) => {
        fragment.appendChild(createBeyCard({ bey, playerKey }));
    });

    container.appendChild(fragment);
}

function createBeyCard({ bey, playerKey }) {
    const fragment = elements.beyCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".bey-card");
    const image = fragment.querySelector(".bey-card-image");
    const name = fragment.querySelector(".bey-card-name");
    const series = fragment.querySelector(".bey-card-series");

    card.dataset.beyId = bey.id;
    card.dataset.player = playerKey;
    card.style.setProperty("--bey-primary", bey.theme?.primary ?? "#72e9ff");
    card.style.setProperty("--bey-glow", bey.theme?.glow ?? "#9bf5ff");

    image.src = bey.avatar;
    image.alt = bey.name;
    name.textContent = bey.name;
    series.textContent = bey.series ?? "Beyblade X";

    image.addEventListener("error", () => image.classList.add("is-missing"));
    card.addEventListener("click", () => toggleBeySelection({ playerKey, beyId: bey.id }));

    return card;
}

function toggleBeySelection({ playerKey, beyId }) {
    const deckProperty = `${playerKey}Deck`;
    const deck = state[deckProperty];

    if (deck.includes(beyId)) {
        state[deckProperty] = deck.filter((id) => id !== beyId);
    } else if (MAX_DECK_SIZE === 1) {
        state[deckProperty] = [beyId];
    } else {
        if (deck.length >= MAX_DECK_SIZE) {
            showFeedback(`O Deck pode possuir no máximo ${MAX_DECK_SIZE} Beys.`, "error");
            return;
        }

        state[deckProperty] = [...deck, beyId];
    }

    updateSelectionInterface();
}

function updateSelectionInterface() {
    updatePlayerCards("player1");
    updatePlayerCards("player2");

    elements.player1SelectionCount.textContent = `${state.player1Deck.length} / ${MAX_DECK_SIZE}`;
    elements.player2SelectionCount.textContent = `${state.player2Deck.length} / ${MAX_DECK_SIZE}`;

    updateCreateButton();
}

function updatePlayerCards(playerKey) {
    const deck = state[`${playerKey}Deck`];
    const cards = document.querySelectorAll(`.bey-card[data-player="${playerKey}"]`);

    cards.forEach((card) => {
        const selected = deck.includes(card.dataset.beyId);
        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-pressed", String(selected));
    });
}

function updateCreateButton() {
    const hasNames = elements.player1Name.value.trim() !== "" && elements.player2Name.value.trim() !== "";
    const hasDecks = state.player1Deck.length > 0 && state.player2Deck.length > 0;

    elements.createBattleButton.disabled = !hasNames || !hasDecks || state.creatingBattle;
}

async function createBattle() {
    if (state.creatingBattle) return;

    const player1Name = elements.player1Name.value.trim();
    const player2Name = elements.player2Name.value.trim();

    if (!player1Name || !player2Name) {
        showFeedback("Preencha o nome dos dois jogadores.", "error");
        return;
    }

    if (!state.player1Deck.length || !state.player2Deck.length) {
        showFeedback("Escolha um Bey para cada jogador.", "error");
        return;
    }

    state.creatingBattle = true;
    updateCreateButton();
    elements.createBattleButton.textContent = "Configurando...";

    try {
        const response = await fetch("/api/battle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                player1: { name: player1Name, deck: state.player1Deck },
                player2: { name: player2Name, deck: state.player2Deck }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error ?? "Não foi possível configurar a batalha.");
        }

        showFeedback(data.message, "success");
    } catch (error) {
        console.error(error);
        showFeedback(error.message, "error");
    } finally {
        state.creatingBattle = false;
        elements.createBattleButton.textContent = "Configurar nova batalha";
        updateCreateButton();
    }
}

function sendCommand(eventName, payload) {
    socket.emit(eventName, payload, (response = {}) => {
        showFeedback(
            response.message ?? "Comando enviado.",
            response.success === false ? "error" : "success"
        );
    });
}

function showFeedback(message, type = "neutral") {
    elements.commandFeedback.textContent = message;
    elements.commandFeedback.dataset.type = type;
}