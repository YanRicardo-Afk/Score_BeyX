class ThemeTimeline {
    constructor({
        finishBanner,
        scoreAnimationDuration = 540,
        scorePauseDuration = 280,
        winnerDelay = 320
    }) {
        if (!(finishBanner instanceof FinishBanner)) {
            throw new Error(
                "ThemeTimeline precisa receber um FinishBanner."
            );
        }

        this.finishBanner = finishBanner;

        this.scoreAnimationDuration =
            scoreAnimationDuration;

        this.scorePauseDuration =
            scorePauseDuration;

        this.winnerDelay =
            winnerDelay;

        this.queue = Promise.resolve();
        this.running = false;
    }

    playRoundResult({
        finish,
        battle,
        applyBattleState,
        showWinner
    }) {
        return this.enqueue(async () => {
            this.running = true;

            await this.finishBanner.show(finish);

            await applyBattleState(battle, {
                animateScore: true
            });

            await this.wait(
                this.scoreAnimationDuration +
                this.scorePauseDuration
            );

            if (
                battle.status === "finished" &&
                battle.winner
            ) {
                await this.wait(this.winnerDelay);
                await showWinner(battle.winner);
            }

            this.running = false;
        });
    }

    applyImmediate(action) {
        return this.enqueue(async () => {
            await action();
        });
    }

    enqueue(action) {
        this.queue = this.queue
            .then(action)
            .catch((error) => {
                this.running = false;

                console.error(
                    "Erro na ThemeTimeline:",
                    error
                );
            });

        return this.queue;
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

window.ThemeTimeline = ThemeTimeline;