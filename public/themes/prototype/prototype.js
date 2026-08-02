const FINISH_LABELS = {
    spin: "SPIN FINISH",
    over: "OVER FINISH",
    burst: "BURST FINISH",
    xtreme: "XTREME FINISH"
};

const state = {
    socket: null,
    battle: null,
    pendingFinish: null,
    scoreAnimationDuration: 540
};

const elements = {
    prototypeHud:
        document.getElementById("prototype-hud"),

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
        document.getElementById(
            "winner-background-image"
        ),

    winnerBeyImage:
        document.getElementById("winner-bey-image"),

    winnerBeyName:
        document.getElementById("winner-bey-name"),

    techShapes:
        document.getElementById("tech-shapes"),

    loadingScreen:
        document.getElementById("loading-screen"),

    loadingProgressBar:
        document.getElementById(
            "loading-progress-bar"
        ),

    loadingProgressText:
        document.getElementById(
            "loading-progress-text"
        ),

    loadingStatus:
        document.getElementById("loading-status")
};

const background = new Background({
    container: elements.techShapes,
    amount: 18
});

const finishBanner = new FinishBanner({
    overlay: elements.finishOverlay,
    title: elements.finishTitle,
    labels: FINISH_LABELS,
    displayDuration: 1500,
    exitDuration: 480
});

const timeline = new ThemeTimeline({
    finishBanner,
    scoreAnimationDuration:
        state.scoreAnimationDuration,
    scorePauseDuration: 280,
    winnerDelay: 320
});

const loadingScreen = new LoadingScreen({
    container: elements.loadingScreen,
    progressBar: elements.loadingProgressBar,
    progressText: elements.loadingProgressText,
    statusText: elements.loadingStatus
});

initializeTheme();

async function initializeTheme() {
    try {
        background.initialize();
        loadingScreen.show();

        setupImageFallback(
            elements.player1BeyImage
        );

        setupImageFallback(
            elements.player2BeyImage
        );

        const assetLoader = new AssetLoader({
            assets: PrototypeAssets,

            onProgress: ({ progress }) => {
                loadingScreen.updateProgress(
                    progress
                );
            },

            onStatusChange: (message) => {
                loadingScreen.updateStatus(
                    message
                );
            }
        });

        const result =
            await assetLoader.loadAll();

        if (result.errors.length > 0) {
            console.warn(
                "Alguns assets não foram carregados:",
                result.errors
            );
        }

        loadingScreen.updateStatus(
            "Conectando ao servidor..."
        );

        connectSocket();

        await wait(280);

        elements.prototypeHud.classList.remove(
            "is-loading"
        );

        await loadingScreen.hide();
    } catch (error) {
        console.error(
            "Erro ao inicializar o Prototype:",
            error
        );

        loadingScreen.updateStatus(
            "Falha ao inicializar o HUD."
        );
    }
}

function connectSocket() {
    state.socket = io();

    state.socket.on("connect", () => {
        elements.connectionStatus.textContent =
            "ONLINE";

        elements.connectionStatus.style.opacity =
            "1";

        window.setTimeout(() => {
            elements.connectionStatus.style.opacity =
                "0.35";
        }, 1600);
    });

    state.socket.on("disconnect", () => {
        elements.connectionStatus.textContent =
            "OFFLINE";

        elements.connectionStatus.style.opacity =
            "1";
    });

    state.socket.on(
        "state:sync",
        (battle) => {
            state.pendingFinish = null;

            renderBattle(battle, {
                animateScore: false
            });
        }
    );

    state.socket.on(
        "finish:registered",
        (finish) => {
            state.pendingFinish = finish;
        }
    );

    state.socket.on(
        "battle:state",
        (battle) => {
            if (
                state.pendingFinish &&
                battle.status !== "waiting"
            ) {
                const finish =
                    state.pendingFinish;

                state.pendingFinish = null;

                timeline.playRoundResult({
                    finish,
                    battle,

                    applyBattleState:
                        async (
                            nextBattle,
                            options
                        ) => {
                            renderBattle(
                                nextBattle,
                                options
                            );
                        },

                    showWinner:
                        async (winner) => {
                            showWinner(winner);
                        }
                });

                return;
            }

            timeline.applyImmediate(
                async () => {
                    renderBattle(battle, {
                        animateScore: false
                    });
                }
            );
        }
    );
}

function renderBattle(
    battle,
    { animateScore = false } = {}
) {
    if (!battle) {
        return;
    }

    const previousBattle = state.battle;

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
        finishBanner.hide();
    }

    state.battle = battle;
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
        element.classList.remove(
            "is-changing"
        );
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
        elements.player1Card.classList.add(
            "is-leading"
        );

        elements.player2Card.classList.add(
            "is-dimmed"
        );

        return;
    }

    elements.player2Card.classList.add(
        "is-leading"
    );

    elements.player1Card.classList.add(
        "is-dimmed"
    );
}

function showWinner(winner) {
    const imagePath =
        winner.bey.image ||
        getDefaultBeyImage(winner.id);

    elements.winnerBeyName.textContent =
        winner.bey.name;

    elements.winnerBeyImage.src =
        imagePath;

    elements.winnerBackgroundImage.src =
        imagePath;

    elements.winnerOverlay.classList.add(
        "is-visible"
    );
}

function hideWinner() {
    elements.winnerOverlay.classList.remove(
        "is-visible"
    );
}

function updateBeyImage(
    imageElement,
    imagePath
) {
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
    imageElement.addEventListener(
        "error",
        () => {
            imageElement.classList.add(
                "is-missing"
            );
        }
    );

    imageElement.addEventListener(
        "load",
        () => {
            imageElement.classList.remove(
                "is-missing"
            );
        }
    );
}

function wait(duration) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}