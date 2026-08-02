class ScoreCounter {
    constructor({
        element,
        animationDuration = 620
    }) {
        if (!(element instanceof HTMLElement)) {
            throw new Error(
                "ScoreCounter precisa receber um elemento HTML válido."
            );
        }

        this.element = element;
        this.animationDuration = animationDuration;
        this.currentScore = Number(element.textContent) || 0;
        this.animationToken = 0;
    }

    set(score, {
        animate = true
    } = {}) {
        if (!Number.isInteger(score) || score < 0) {
            throw new Error(
                "ScoreCounter precisa receber uma pontuação inteira e positiva."
            );
        }

        if (!animate || score === this.currentScore) {
            this.cancelAnimation();
            this.currentScore = score;
            this.element.textContent = score;

            return Promise.resolve();
        }

        return this.animateTo(score);
    }

    animateTo(score) {
        this.cancelAnimation();

        const token = ++this.animationToken;
        const middle = this.animationDuration * 0.47;

        this.element.classList.add("is-changing");

        return new Promise((resolve) => {
            window.setTimeout(() => {
                if (token !== this.animationToken) {
                    resolve();
                    return;
                }

                this.currentScore = score;
                this.element.textContent = score;
            }, middle);

            window.setTimeout(() => {
                if (token !== this.animationToken) {
                    resolve();
                    return;
                }

                this.element.classList.remove("is-changing");
                this.element.classList.add("has-changed");

                window.setTimeout(() => {
                    this.element.classList.remove("has-changed");
                }, 360);

                resolve();
            }, this.animationDuration);
        });
    }

    cancelAnimation() {
        this.animationToken += 1;

        this.element.classList.remove(
            "is-changing",
            "has-changed"
        );
    }

    getScore() {
        return this.currentScore;
    }
}

window.ScoreCounter = ScoreCounter;