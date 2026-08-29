class FinishBanner {
    constructor({
        overlay,
        title,
        labels = {},
        displayDuration = 1500,
        exitDuration = 480,
        animationEngine = "css"
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

        this.banner =
            this.overlay.querySelector(".finish-banner");

        this.backdrop =
            this.overlay.querySelector(".event-backdrop");

        this.labels = labels;

        this.displayDuration = displayDuration;
        this.exitDuration = exitDuration;

        this.animationEngine = animationEngine;

        this.running = false;
        this.currentType = null;

        this.gsapTimeline = null;
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

        if (this.animationEngine === "gsap") {
            await this.showWithGsap();
        } else {
            await this.showWithCss();
        }

        this.running = false;
    }

    async showWithCss() {
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
    }

    showWithGsap() {
        if (typeof gsap === "undefined") {
            console.warn(
                "GSAP não foi encontrado. Usando animação CSS."
            );

            return this.showWithCss();
        }

        if (this.gsapTimeline) {
            this.gsapTimeline.kill();
            this.gsapTimeline = null;
        }

        this.prepareGsapState();

        return new Promise((resolve) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    this.gsapTimeline = null;
                    this.hide();
                    resolve();
                }
            });

            this.gsapTimeline = timeline;

            timeline
                .set(this.overlay, {
                    visibility: "visible",
                    pointerEvents: "none"
                })

                .to(
                    this.backdrop,
                    {
                        opacity: 1,
                        duration: 0.18,
                        ease: "power2.out"
                    },
                    0
                )

                .fromTo(
                    this.banner,
                    {
                        opacity: 0,
                        scaleX: 0.72,
                        scaleY: 0.92,
                        y: 14
                    },
                    {
                        opacity: 1,
                        scaleX: 1,
                        scaleY: 1,
                        y: 0,
                        duration: 0.42,
                        ease: "power3.out"
                    },
                    0.04
                )

                .fromTo(
                    this.title,
                    {
                        opacity: 0,
                        y: 18,
                        scale: 0.88,
                        filter: "blur(5px)"
                    },
                    {
                        opacity: 1,
                        y: -2,
                        scale: 1.04,
                        filter: "blur(0px)",
                        duration: 0.42,
                        ease: "power3.out"
                    },
                    0.12
                )

                .to(
                    this.title,
                    {
                        y: 0,
                        scale: 1,
                        duration: 0.16,
                        ease: "power2.out"
                    }
                )

                .to(
                    {},
                    {
                        duration: 0.78
                    }
                )

                .to(
                    this.title,
                    {
                        opacity: 0,
                        y: -10,
                        scale: 1.035,
                        duration: 0.28,
                        ease: "power2.in"
                    }
                )

                .to(
                    this.banner,
                    {
                        opacity: 0,
                        scaleX: 1.08,
                        duration: 0.3,
                        ease: "power2.in"
                    },
                    "<0.02"
                )

                .to(
                    this.backdrop,
                    {
                        opacity: 0,
                        duration: 0.24,
                        ease: "power1.in"
                    },
                    "<0.04"
                );
        });
    }

    prepareGsapState() {
        this.overlay.classList.remove(
            "is-visible",
            "is-entering",
            "is-leaving"
        );

        gsap.killTweensOf([
            this.overlay,
            this.banner,
            this.backdrop,
            this.title
        ]);

        gsap.set(this.overlay, {
            visibility: "hidden"
        });

        gsap.set(this.backdrop, {
            opacity: 0
        });

        gsap.set(this.banner, {
            opacity: 0,
            transformOrigin: "center center"
        });

        gsap.set(this.title, {
            opacity: 0,
            transformOrigin: "center center"
        });
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

        if (
            this.animationEngine === "gsap" &&
            typeof gsap !== "undefined"
        ) {
            gsap.set(this.overlay, {
                clearProps: "visibility,pointerEvents"
            });

            gsap.set(
                [
                    this.banner,
                    this.backdrop,
                    this.title
                ],
                {
                    clearProps:
                        "opacity,transform,filter"
                }
            );
        }

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