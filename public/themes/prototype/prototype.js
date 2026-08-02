const socket = io();

const FINISH_LABELS = {
    spin: "SPIN FINISH",
    over: "OVER FINISH",
    burst: "BURST FINISH",
    xtreme: "XTREME FINISH"
};

const state = {
    battle: null,
    scoreAnimationDuration: 540,
    finishDisplayDuration: 1500
};

const elements = {
    connectionStatus:
        document.getElementById("connection-status"),

    player1Card:
        document.getElementById("player1-card"),

    player2Card:
        document.getElementById("player2-card"),

    player1BeyName:
        document.getElementById("player1-bey-name"),

    player2BeyName:
        document.getElementById("player2-bey-name"),

    player1BeyImage:
        document.getElementById("player1-bey-image"),

    player2BeyImage:
        document.getElementById("player2-bey-image"),

    player1Score:
        document.getElementById("player1-score"),

    player2Score:
        document.getElementById("player2-score"),

    battleRound:
        document.getElementById("battle-round"),

    finishOverlay:
        document.getElementById("finish-overlay"),

    finishTitle:
        document.getElementById("finish-title"),

    winnerOverlay:
        document.getElementById("winner-overlay"),

    winnerBackgroundImage:
        document.getElementById("winner-background-image"),

    winnerBeyImage:
        document.getElementById("winner-bey-image"),

    winnerBeyName:
        document.getElementById("winner-bey-name"),

    techShapes:
        document.getElementById("tech-shapes")
};

setupImageFallback(elements.player1BeyImage);
setupImageFallback(elements.player2BeyImage);

createTechShapes(18);

socket.on("connect", () => {
    elements.connectionStatus.textContent =
        "ONLINE";

    elements.connectionStatus.style.opacity = "1";

    window.setTimeout(() => {
        elements.connectionStatus.style.opacity = "0.35";
    }, 1600);
});

socket.on("disconnect", () => {
    elements.connectionStatus.textContent =
        "OFFLINE";

    elements.connectionStatus.style.opacity = "1";
});

socket.on("state:sync", (battle) => {
    renderBattle(battle, {
        animateScore: false
    });
});

socket.on("battle:state", (battle) => {
    renderBattle(battle, {
        animateScore: true
    });
});

socket.on("finish:registered", (finish) => {
    showFinish(finish);
});

function renderBattle(
    battle,
    { animateScore }
) {
    if (!battle) {
        return;
    }

    const previousBattle = state.battle;
    state.battle = battle;

    elements.player1BeyName.textContent =
        battle.player1.bey.name;

    elements.player2BeyName.textContent =
        battle.player2.bey.name;

    updateBeyImage(
        elements.player1BeyImage,
        battle.player1.bey.image
    );

    updateBeyImage(
        elements.player2BeyImage,
        battle.player2.bey.image
    );

    updateScore({
        element: elements.player1Score,
        previousScore:
            previousBattle?.player1?.score,
        nextScore: battle.player1.score,
        animate: animateScore
    });

    updateScore({
        element: elements.player2Score,
        previousScore:
            previousBattle?.player2?.score,
        nextScore: battle.player2.score,
        animate: animateScore
    });

    elements.battleRound.textContent =
        battle.round;

    updateLeader(battle);

    if (battle.status === "waiting") {
        hideWinner();
    }

    if (
        battle.status === "finished" &&
        battle.winner
    ) {
        window.setTimeout(() => {
            showWinner(battle.winner);
        }, state.finishDisplayDuration + 240);
    }
}

function updateScore({
    element,
    previousScore,
    nextScore,
    animate
}) {
    const hasChanged =
        previousScore !== undefined &&
        previousScore !== nextScore;

    if (!animate || !hasChanged) {
        element.textContent = nextScore;
        return;
    }

    element.classList.remove("is-changing");

    void element.offsetWidth;

    element.classList.add("is-changing");

    window.setTimeout(() => {
        element.textContent = nextScore;
    }, state.scoreAnimationDuration * 0.5);

    window.setTimeout(() => {
        element.classList.remove("is-changing");
    }, state.scoreAnimationDuration);
}

function updateLeader(battle) {
    const player1Score = battle.player1.score;
    const player2Score = battle.player2.score;

    elements.player1Card.classList.remove(
        "is-leading",
        "is-dimmed"
    );

    elements.player2Card.classList.remove(
        "is-leading",
        "is-dimmed"
    );

    if (player1Score === player2Score) {
        return;
    }

    if (player1Score > player2Score) {
        elements.player1Card.classList.add("is-leading");
        elements.player2Card.classList.add("is-dimmed");
        return;
    }

    elements.player2Card.classList.add("is-leading");
    elements.player1Card.classList.add("is-dimmed");
}

function showFinish(finish) {
    elements.finishTitle.textContent =
        FINISH_LABELS[finish.type] ??
        `${finish.type} FINISH`;

    elements.finishOverlay.classList.remove(
        "is-leaving"
    );

    elements.finishOverlay.classList.add(
        "is-visible",
        "is-entering"
    );

    window.setTimeout(() => {
        elements.finishOverlay.classList.remove(
            "is-entering"
        );

        elements.finishOverlay.classList.add(
            "is-leaving"
        );
    }, state.finishDisplayDuration);

    window.setTimeout(() => {
        elements.finishOverlay.classList.remove(
            "is-visible",
            "is-leaving"
        );
    }, state.finishDisplayDuration + 480);
}

function showWinner(winner) {
    const imagePath =
        winner.bey.image ||
        getDefaultBeyImage(winner.id);

    elements.winnerBeyName.textContent =
        winner.bey.name;

    elements.winnerBeyImage.src = imagePath;
    elements.winnerBackgroundImage.src = imagePath;

    elements.winnerOverlay.classList.add(
        "is-visible"
    );
}

function hideWinner() {
    elements.winnerOverlay.classList.remove(
        "is-visible"
    );
}

function updateBeyImage(imageElement, imagePath) {
    if (!imagePath) {
        return;
    }

    imageElement.src = imagePath;
}

function getDefaultBeyImage(playerId) {
    if (playerId === "player-1") {
        return "/themes/prototype/assets/images/player1-bey.png";
    }

    return "/themes/prototype/assets/images/player2-bey.png";
}

function setupImageFallback(imageElement) {
    imageElement.addEventListener("error", () => {
        imageElement.classList.add("is-missing");
    });

    imageElement.addEventListener("load", () => {
        imageElement.classList.remove("is-missing");
    });
}

function createTechShapes(amount) {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < amount; index += 1) {
        const shape = document.createElement("span");

        const width = randomBetween(55, 220);
        const height = randomBetween(24, 130);

        shape.className = "tech-shape";

        shape.style.width = `${width}px`;
        shape.style.height = `${height}px`;

        shape.style.left =
            `${randomBetween(-10, 95)}%`;

        shape.style.top =
            `${randomBetween(-20, 100)}%`;

        shape.style.setProperty(
            "--duration",
            `${randomBetween(14, 34)}s`
        );

        shape.style.animationDelay =
            `${randomBetween(-24, 0)}s`;

        fragment.appendChild(shape);
    }

    elements.techShapes.appendChild(fragment);
}

function randomBetween(minimum, maximum) {
    return Math.random() * (maximum - minimum) + minimum;
}