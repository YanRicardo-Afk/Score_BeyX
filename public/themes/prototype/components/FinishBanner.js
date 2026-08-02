class FinishBanner {
    constructor({
        overlay,
        title,
        labels = {},
        displayDuration = 1500,
        exitDuration = 480
    }) {
        if (!(overlay instanceof HTMLElement)) {
            throw new Error(
                "FinishBanner precisa receber um overlay válido."
            );
        }

        if (!(title instanceof HTMLElement)) {
            throw new Error(
                "FinishBanner precisa receber um título válido."
            );
        }

        this.overlay = overlay;
        this.title = title;
        this.labels = labels;

        this.displayDuration = displayDuration;
        this.exitDuration = exitDuration;

        this.running = false;
    }

    async show(finish) {
        if (!finish?.type) {
            throw new Error(
                "FinishBanner precisa receber uma finalização válida."
            );
        }

        this.running = true;

        this.title.textContent =
            this.labels[finish.type] ??
            `${finish.type.toUpperCase()} FINISH`;

        this.overlay.classList.remove(
            "is-leaving"
        );

        this.overlay.classList.add(
            "is-visible",
            "is-entering"
        );

        await this.wait(this.displayDuration);

        this.overlay.classList.remove(
            "is-entering"
        );

        this.overlay.classList.add(
            "is-leaving"
        );

        await this.wait(this.exitDuration);

        this.hide();

        this.running = false;
    }

    hide() {
        this.overlay.classList.remove(
            "is-visible",
            "is-entering",
            "is-leaving"
        );
    }

    isRunning() {
        return this.running;
    }

    wait(duration) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, duration);
        });
    }
}

window.FinishBanner = FinishBanner;