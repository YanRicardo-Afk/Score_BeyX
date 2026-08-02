class PlayerCard {
    constructor({
        container,
        nameElement,
        imageElement,
        fallbackElement
    }) {
        if (!(container instanceof HTMLElement)) {
            throw new Error(
                "PlayerCard precisa receber um container válido."
            );
        }

        if (!(nameElement instanceof HTMLElement)) {
            throw new Error(
                "PlayerCard precisa receber um elemento de nome válido."
            );
        }

        if (!(imageElement instanceof HTMLImageElement)) {
            throw new Error(
                "PlayerCard precisa receber uma imagem válida."
            );
        }

        this.container = container;
        this.nameElement = nameElement;
        this.imageElement = imageElement;
        this.fallbackElement = fallbackElement;

        this.player = null;
        this.roundHighlightTimer = null;

        this.setupImageFallback();
    }

    setPlayer(player, {
        fallbackImage = null
    } = {}) {
        if (!player?.bey) {
            throw new Error(
                "PlayerCard precisa receber um jogador com Bey."
            );
        }

        this.player = player;

        this.nameElement.textContent =
            player.bey.name;

        const imagePath =
            player.bey.image ||
            fallbackImage;

        if (imagePath) {
            this.imageElement.src = imagePath;
        }
    }

    setBattlePosition(position) {
        this.container.classList.remove(
            "is-leading",
            "is-dimmed"
        );

        if (position === "leading") {
            this.container.classList.add(
                "is-leading"
            );
        }

        if (position === "dimmed") {
            this.container.classList.add(
                "is-dimmed"
            );
        }
    }

    highlightRoundWinner() {
        window.clearTimeout(
            this.roundHighlightTimer
        );

        this.container.classList.remove(
            "is-round-winner"
        );

        void this.container.offsetWidth;

        this.container.classList.add(
            "is-round-winner"
        );

        this.roundHighlightTimer =
            window.setTimeout(() => {
                this.container.classList.remove(
                    "is-round-winner"
                );
            }, 900);
    }

    reset() {
        window.clearTimeout(
            this.roundHighlightTimer
        );

        this.container.classList.remove(
            "is-leading",
            "is-dimmed",
            "is-round-winner"
        );
    }

    setupImageFallback() {
        this.imageElement.addEventListener(
            "error",
            () => {
                this.imageElement.classList.add(
                    "is-missing"
                );

                this.fallbackElement?.classList.add(
                    "is-visible"
                );
            }
        );

        this.imageElement.addEventListener(
            "load",
            () => {
                this.imageElement.classList.remove(
                    "is-missing"
                );

                this.fallbackElement?.classList.remove(
                    "is-visible"
                );
            }
        );
    }
}

window.PlayerCard = PlayerCard;