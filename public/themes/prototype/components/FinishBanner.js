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
        this.currentType = null;
    }

    async show(finish) {
        if (!finish?.type) {
            throw new Error(
                "FinishBanner precisa receber uma finalização válida."
            );
        }

        this.running = true;
        this.currentType = finish.type;

        this.applyFinishType(finish.type);

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

    applyFinishType(type) {
        this.overlay.dataset.finishType = type;

        this.overlay.classList.remove(
            "finish-spin",
            "finish-over",
            "finish-burst",
            "finish-xtreme"
        );

        this.overlay.classList.add(
            `finish-${type}`
        );
    }

    hide() {
        this.overlay.classList.remove(
            "is-visible",
            "is-entering",
            "is-leaving",
            "finish-spin",
            "finish-over",
            "finish-burst",
            "finish-xtreme"
        );

        delete this.overlay.dataset.finishType;

        this.currentType = null;
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