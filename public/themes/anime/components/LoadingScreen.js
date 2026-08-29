class LoadingScreen {
    constructor({
        container,
        progressBar,
        progressText,
        statusText
    }) {
        this.container = container;
        this.progressBar = progressBar;
        this.progressText = progressText;
        this.statusText = statusText;
    }

    show() {
        this.container.classList.remove(
            "is-hidden"
        );
    }

    updateProgress(progress) {
        this.progressBar.style.width =
            `${progress}%`;

        this.progressText.textContent =
            `${progress}%`;
    }

    updateStatus(message) {
        this.statusText.textContent = message;
    }

    async hide() {
        this.container.classList.add(
            "is-leaving"
        );

        await this.wait(520);

        this.container.classList.add(
            "is-hidden"
        );

        this.container.classList.remove(
            "is-leaving"
        );
    }

    wait(duration) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, duration);
        });
    }
}

window.LoadingScreen = LoadingScreen;