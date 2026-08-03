class WinnerScreen {
    constructor({
        overlay,
        beyImage,
        backgroundImage,
        beyName,
        displayDuration = 0
    }) {
        if (!(overlay instanceof HTMLElement)) {
            throw new Error(
                "WinnerScreen precisa receber um overlay válido."
            );
        }

        if (!(beyImage instanceof HTMLImageElement)) {
            throw new Error(
                "WinnerScreen precisa receber uma imagem principal válida."
            );
        }

        if (!(backgroundImage instanceof HTMLImageElement)) {
            throw new Error(
                "WinnerScreen precisa receber uma imagem de fundo válida."
            );
        }

        if (!(beyName instanceof HTMLElement)) {
            throw new Error(
                "WinnerScreen precisa receber um elemento de nome válido."
            );
        }

        this.overlay = overlay;
        this.beyImage = beyImage;
        this.backgroundImage = backgroundImage;
        this.beyName = beyName;
        this.displayDuration = displayDuration;

        this.visible = false;
    }

    async show(winner, {
        fallbackImage
    } = {}) {
        if (!winner?.bey) {
            throw new Error(
                "WinnerScreen precisa receber um vencedor com Bey."
            );
        }

        const imagePath =
            winner.bey.image ||
            fallbackImage;

        this.beyName.textContent =
            winner.bey.name;

        if (imagePath) {
            this.beyImage.src = imagePath;
            this.backgroundImage.src = imagePath;
        }

        this.overlay.classList.remove(
            "is-leaving"
        );

        void this.overlay.offsetWidth;

        this.overlay.classList.add(
            "is-visible",
            "is-entering"
        );

        this.visible = true;

        await this.wait(920);

        this.overlay.classList.remove(
            "is-entering"
        );

        if (this.displayDuration > 0) {
            await this.wait(this.displayDuration);
        }
    }

    async hide() {
        if (!this.visible) {
            return;
        }

        this.overlay.classList.remove(
            "is-entering"
        );

        this.overlay.classList.add(
            "is-leaving"
        );

        await this.wait(520);

        this.overlay.classList.remove(
            "is-visible",
            "is-leaving"
        );

        this.visible = false;
    }

    isVisible() {
        return this.visible;
    }

    wait(duration) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, duration);
        });
    }
}

window.WinnerScreen = WinnerScreen;