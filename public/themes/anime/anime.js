const FINISH_LABELS = {
    spin: "SPIN FINISH",
    over: "OVER FINISH",
    burst: "BURST FINISH",
    xtreme: "XTREME FINISH"
};

const FLASH_INTENSITY_BY_FINISH = {
    spin: 1.08,
    over: 1.18,
    burst: 1.34,
    xtreme: 1.5
};

const state = {
    socket: null,
    battle: null,
    initialBattle: null,
    pendingFinish: null,
    scoreAnimationDuration: 540,

    loadedAssetSources: new Set()
};

const elements = {
    prototypeHud:
        document.getElementById("prototype-hud"),

    fullscreenButton:
    document.getElementById("fullscreen-button"),
    
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

    player1Fallback:
        document.querySelector(
            "#player1-card .bey-fallback"
        ),

    player2Fallback:
        document.querySelector(
            "#player2-card .bey-fallback"
        ),

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

    techBackground:
        document.querySelector(
            ".tech-background"
        ),

    techParticles:
        document.getElementById(
            "tech-particles"
        ),

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
    particleContainer:
        elements.techParticles,
    root: elements.techBackground,
    amount: 18,
    particleAmount: 26
});

const finishBanner = new FinishBanner({
    overlay: elements.finishOverlay,
    title: elements.finishTitle,
    labels: FINISH_LABELS,
    displayDuration: 1500,
    exitDuration: 480,
    animationEngine: "css"
});

const timeline = new ThemeTimeline({
    finishBanner,
    background,
    flashIntensityByFinish:
        FLASH_INTENSITY_BY_FINISH,
    scoreAnimationDuration:
        state.scoreAnimationDuration,
    scorePauseDuration: 280,
    winnerDelay: 320
});

const player1ScoreCounter = new ScoreCounter({
    element: elements.player1Score,
    animationDuration:
        state.scoreAnimationDuration
});

const player2ScoreCounter = new ScoreCounter({
    element: elements.player2Score,
    animationDuration:
        state.scoreAnimationDuration
});

const player1Card = new PlayerCard({
    container: elements.player1Card,
    nameElement: elements.player1BeyName,
    imageElement: elements.player1BeyImage,
    fallbackElement: elements.player1Fallback
});

const player2Card = new PlayerCard({
    container: elements.player2Card,
    nameElement: elements.player2BeyName,
    imageElement: elements.player2BeyImage,
    fallbackElement: elements.player2Fallback
});

const winnerScreen = new WinnerScreen({
    overlay: elements.winnerOverlay,
    beyImage: elements.winnerBeyImage,
    backgroundImage:
        elements.winnerBackgroundImage,
    beyName: elements.winnerBeyName
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
        setupFullscreen();

        background.initialize();
        loadingScreen.show();

        loadingScreen.updateStatus(
            "Conectando ao servidor..."
        );

        const initialBattle =
            await connectSocket();

        state.initialBattle =
            initialBattle;

        loadingScreen.updateStatus(
            "Preparando assets..."
        );

        await preloadBattleAssets(
    initialBattle,
    {
        showProgress: true
    }
);

        if (initialBattle) {
            await renderBattle(
                initialBattle,
                {
                    animateScore: false
                }
            );
        }

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

    return new Promise((resolve) => {
        let initialStateReceived =
            false;

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

        state.socket.on(
            "disconnect",
            () => {
                elements.connectionStatus.textContent =
                    "OFFLINE";

                elements.connectionStatus.style.opacity =
                    "1";
            }
        );

        state.socket.on(
            "state:sync",
            (battle) => {
                state.pendingFinish = null;

                if (!initialStateReceived) {
                    initialStateReceived =
                        true;

                    resolve(battle);

                    return;
                }

                timeline.applyImmediate(
                    async () => {
                        await renderBattle(
                            battle,
                            {
                                animateScore:
                                    false
                            }
                        );
                    }
                );
            }
        );

        state.socket.on(
            "finish:registered",
            (finish) => {
                state.pendingFinish =
                    finish;
            }
        );

        state.socket.on(
        "battle:state",
        async (battle) => {

            await preloadBattleAssets(battle);

                if (
                    state.pendingFinish &&
                    battle.status !== "waiting"
                ) {
                    const finish =
                        state.pendingFinish;

                    state.pendingFinish =
                        null;

                    timeline.playRoundResult({
                        finish,
                        battle,

                        applyBattleState:
                            async (
                                nextBattle,
                                options
                            ) => {
                                await renderBattle(
                                    nextBattle,
                                    options
                                );
                            },

                        showWinner:
                            async (winner) => {
                                await winnerScreen.show(
                                    winner,
                                    {
                                        fallbackImage:
                                            getDefaultBeyImage(
                                                winner.id
                                            )
                                    }
                                );
                            }
                    });

                    return;
                }

                timeline.applyImmediate(
                    async () => {
                        await renderBattle(
                            battle,
                            {
                                animateScore:
                                    false
                            }
                        );
                    }
                );
            }
        );
    });
}

async function preloadBattleAssets(
    battle,
    {
        showProgress = false
    } = {}
) {
    if (!battle) {
        return;
    }

    const assets =
        createPrototypeAssets(battle);

    const missingAssets = {
        images:
            assets.images.filter(
                (source) =>
                    !state.loadedAssetSources.has(
                        source
                    )
            ),

        fonts:
            assets.fonts.filter(
                (source) => {
                    const key =
                        typeof source === "string"
                            ? source
                            : source.source;

                    return !state.loadedAssetSources.has(
                        key
                    );
                }
            ),

        audio:
            assets.audio.filter(
                (source) => {
                    const key =
                        typeof source === "string"
                            ? source
                            : source.source;

                    return !state.loadedAssetSources.has(
                        key
                    );
                }
            ),

        videos:
            assets.videos.filter(
                (source) => {
                    const key =
                        typeof source === "string"
                            ? source
                            : source.source;

                    return !state.loadedAssetSources.has(
                        key
                    );
                }
            )
    };

    const totalMissing =
        missingAssets.images.length +
        missingAssets.fonts.length +
        missingAssets.audio.length +
        missingAssets.videos.length;

    if (totalMissing === 0) {
        return;
    }

    const assetLoader =
        new AssetLoader({
            assets: missingAssets,

            onProgress: ({ progress }) => {
                if (!showProgress) {
                    return;
                }

                loadingScreen.updateProgress(
                    progress
                );
            },

            onStatusChange: (message) => {
                if (!showProgress) {
                    return;
                }

                loadingScreen.updateStatus(
                    message
                );
            }
        });

    const result =
        await assetLoader.loadAll();

    result.loadedAssets.forEach(
        (value, source) => {
            state.loadedAssetSources.add(
                source
            );
        }
    );

    if (result.errors.length > 0) {
        console.warn(
            "Alguns assets da batalha não foram carregados:",
            result.errors
        );
    }
}


async function renderBattle(
    battle,
    { animateScore = false } = {}
) {
    if (!battle) {
        return;
    }

    player1Card.setPlayer(
        battle.player1,
        {
            fallbackImage:
                getDefaultBeyImage("player-1")
        }
    );

    player2Card.setPlayer(
        battle.player2,
        {
            fallbackImage:
                getDefaultBeyImage("player-2")
        }
    );

    const scoreAnimations = [
        player1ScoreCounter.set(
            battle.player1.score,
            {
                animate: animateScore
            }
        ),

        player2ScoreCounter.set(
            battle.player2.score,
            {
                animate: animateScore
            }
        )
    ];

    elements.battleRound.textContent =
        battle.round;

    updateLeader(battle);

    if (battle.status === "waiting") {
        await winnerScreen.hide();

        finishBanner.hide();

        player1Card.reset();
        player2Card.reset();

        background.setIntensity(1);
    }

    state.battle = battle;

    return Promise.all(scoreAnimations);
}

function updateLeader(battle) {
    const player1Score = battle.player1.score;
    const player2Score = battle.player2.score;

    player1Card.setBattlePosition("neutral");
    player2Card.setBattlePosition("neutral");

    if (player1Score === player2Score) {
        return;
    }

    if (player1Score > player2Score) {
        player1Card.setBattlePosition("leading");
        player2Card.setBattlePosition("dimmed");
        return;
    }

    player2Card.setBattlePosition("leading");
    player1Card.setBattlePosition("dimmed");
}

function getDefaultBeyImage() {
    return null;
}

function setupFullscreen() {
    if (!elements.fullscreenButton) {
        return;
    }

    if (!document.documentElement.requestFullscreen) {
        elements.fullscreenButton.classList.add(
            "is-unavailable"
        );

        return;
    }

    elements.fullscreenButton.addEventListener(
        "click",
        toggleFullscreen
    );

    document.addEventListener(
        "fullscreenchange",
        updateFullscreenButton
    );

    updateFullscreenButton();
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen({
                navigationUI: "hide"
            });

            return;
        }

        await document.exitFullscreen();
    } catch (error) {
        console.error(
            "Não foi possível alterar o modo de tela cheia:",
            error
        );
    }
}

function updateFullscreenButton() {
    if (!elements.fullscreenButton) {
        return;
    }

    const isFullscreen =
        Boolean(document.fullscreenElement);

    elements.fullscreenButton.classList.toggle(
        "is-hidden",
        isFullscreen
    );

    elements.fullscreenButton.setAttribute(
        "aria-label",
        isFullscreen
            ? "Sair da tela cheia"
            : "Entrar em tela cheia"
    );

    elements.fullscreenButton.title =
        isFullscreen
            ? "Sair da tela cheia"
            : "Tela cheia";
}


function wait(duration) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}