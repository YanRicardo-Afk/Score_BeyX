class Background {
    constructor({
        container,
        particleContainer,
        root,
        amount = 86,
        particleAmount = 24
    }) {
        if (!(container instanceof HTMLElement)) {
            throw new Error(
                "Background precisa receber um container válido."
            );
        }

        if (!(particleContainer instanceof HTMLElement)) {
            throw new Error(
                "Background precisa receber um container de partículas válido."
            );
        }

        if (!(root instanceof HTMLElement)) {
            throw new Error(
                "Background precisa receber o elemento principal do fundo."
            );
        }

        this.container = container;
        this.particleContainer = particleContainer;
        this.root = root;

        /*
            amount representa a quantidade de PARES.

            Cada par cria:
            - um bloco no lado esquerdo
            - uma cópia espelhada no lado direito

            Portanto, 56 pares = 112 blocos visuais.
        */
        this.amount = amount;
        this.particleAmount = particleAmount;

        this.shapes = [];
        this.particles = [];

        this.initialized = false;
        this.intensity = 1;
        this.flashTimer = null;

        this.shapeTypes = [
            "panel",
            "wide",
            "outline",
            "thin",
            "panel",
            "wide"
        ];

        this.depths = [
            "far",
            "mid",
            "near"
        ];

        this.lanes = [
            { top: 7,  jitter: 2.5, perspective: 0.84, lower: false },
            { top: 15, jitter: 2.5, perspective: 0.88, lower: false },
            { top: 23, jitter: 2.4, perspective: 0.92, lower: false },
            { top: 32, jitter: 2.4, perspective: 0.96, lower: false },
            { top: 41, jitter: 2.3, perspective: 0.99, lower: false },
            { top: 51, jitter: 2.2, perspective: 1.02, lower: false },
            { top: 61, jitter: 2.0, perspective: 1.04, lower: true },
            { top: 70, jitter: 1.8, perspective: 1.06, lower: true },
            { top: 78, jitter: 1.6, perspective: 1.08, lower: true },
            { top: 86, jitter: 1.4, perspective: 1.10, lower: true },
            { top: 93, jitter: 1.2, perspective: 1.12, lower: true }
        ];
    }

    initialize() {
        if (this.initialized) {
            return;
        }

        this.createShapePairs();
        this.createParticlePairs();
        this.setIntensity(1);

        this.initialized = true;
    }

    createShapePairs() {
        const fragment =
            document.createDocumentFragment();

        for (
            let index = 0;
            index < this.amount;
            index += 1
        ) {
            const pair =
                this.createShapePair(index);

            pair.forEach((shape) => {
                this.shapes.push(shape);
                fragment.appendChild(shape);
            });
        }

        this.container.appendChild(fragment);
    }

    createShapePair(index) {
        const type =
            this.shapeTypes[
                index % this.shapeTypes.length
            ];

        const depth =
            this.depths[
                index % this.depths.length
            ];

        const lane =
            this.lanes[
                index % this.lanes.length
            ];

        const dimensions =
            this.getShapeDimensions(
                type,
                depth,
                lane
            );

        const movement =
            this.getDepthSettings(depth);

        /*
            Tudo abaixo é calculado UMA vez e reutilizado
            pelos dois lados. Assim o bloco esquerdo e o
            direito são realmente "gêmeos".
        */
        const top =
            lane.top +
            this.randomBetween(
                -lane.jitter,
                lane.jitter
            );

        const duration =
            this.randomBetween(
                movement.minDuration,
                movement.maxDuration
            );

        const opacity =
            this.randomBetween(
                movement.minOpacity,
                movement.maxOpacity
            );

        const scale =
            this.randomBetween(
                movement.minScale,
                movement.maxScale
            ) * lane.perspective;

        const driftY =
            this.randomBetween(-3, 3);

        const delay =
            this.randomBetween(-10, 0);

        const lowerStrength =
            lane.lower
                ? Math.max(
                    0,
                    (lane.top - 57) / 36
                )
                : 0;

        /*
            V10 — CURVATURA DA ARENA

            A curvatura agora pertence ao CAMINHO do bloco,
            e não ao próprio bloco.

            Assim:
            - o retângulo continua perfeitamente reto;
            - a parte inferior pode acompanhar uma parede
              circular/cilíndrica;
            - esquerda e direita continuam sendo espelhos.

            O valor é compartilhado pelo par.
        */
        const arenaCurve =
            lowerStrength *
            this.randomBetween(18, 34);

        const scaleY = 1;

        const left =
            this.createShape({
                type,
                depth,
                lane,
                side: "left",
                dimensions,
                top,
                duration,
                opacity,
                scale,
                driftY,
                delay,
                arenaCurve,
                scaleY
            });

        const right =
            this.createShape({
                type,
                depth,
                lane,
                side: "right",
                dimensions,
                top,
                duration,
                opacity,
                scale,
                driftY,
                delay,
                arenaCurve,
                scaleY
            });

        return [left, right];
    }

    createShape({
        type,
        depth,
        lane,
        side,
        dimensions,
        top,
        duration,
        opacity,
        scale,
        driftY,
        delay,
        arenaCurve,
        scaleY
    }) {
        const shape =
            document.createElement("span");

        const surface =
            document.createElement("span");

        const lowerClass =
            lane.lower
                ? " anime-lane-lower"
                : "";

        shape.className =
            `tech-shape anime-block anime-mirror-${side} anime-depth-${depth}${lowerClass}`;

        surface.className =
            `anime-block-surface anime-block-${type}`;

        shape.dataset.shapeType = type;
        shape.dataset.depth = depth;
        shape.dataset.side = side;

        shape.style.width =
            `${dimensions.width}px`;

        shape.style.height =
            `${dimensions.height}px`;

        shape.style.top =
            `${top}%`;

        shape.style.setProperty(
            "--block-duration",
            `${duration}s`
        );

        shape.style.setProperty(
            "--block-opacity",
            opacity
        );

        shape.style.setProperty(
            "--block-scale",
            scale
        );

        shape.style.setProperty(
            "--block-drift-y",
            `${driftY}px`
        );

        shape.style.setProperty(
            "--arena-curve",
            `${arenaCurve}px`
        );

        shape.style.setProperty(
            "--arena-scale-y",
            scaleY
        );

        shape.style.animationDelay =
            `${delay}s`;

        shape.appendChild(surface);

        return shape;
    }

    getShapeDimensions(type, depth, lane) {
        const depthMultiplier = {
            far: 0.70,
            mid: 1,
            near: 1.24
        }[depth];

        const lowerLaneMultiplier =
            lane.top >= 78
                ? 0.82
                : lane.top >= 61
                    ? 0.90
                    : 1;

        const dimensions = {
            panel: {
                width: this.randomBetween(62, 170),
                height: this.randomBetween(20, 48)
            },

            wide: {
                width: this.randomBetween(120, 285),
                height: this.randomBetween(17, 42)
            },

            outline: {
                width: this.randomBetween(74, 205),
                height: this.randomBetween(23, 56)
            },

            thin: {
                width: this.randomBetween(105, 260),
                height: this.randomBetween(5, 11)
            }
        };

        return {
            width:
                dimensions[type].width *
                depthMultiplier,

            height:
                dimensions[type].height *
                depthMultiplier *
                lowerLaneMultiplier
        };
    }

    getDepthSettings(depth) {
        const settings = {
            far: {
                minDuration: 5.8,
                maxDuration: 9.2,
                minOpacity: 0.34,
                maxOpacity: 0.52,
                minScale: 0.82,
                maxScale: 0.95
            },

            mid: {
                minDuration: 3.8,
                maxDuration: 6.3,
                minOpacity: 0.46,
                maxOpacity: 0.68,
                minScale: 0.95,
                maxScale: 1.07
            },

            near: {
                minDuration: 2.4,
                maxDuration: 4.3,
                minOpacity: 0.56,
                maxOpacity: 0.82,
                minScale: 1.04,
                maxScale: 1.16
            }
        };

        return settings[depth];
    }

    createParticlePairs() {
        const fragment =
            document.createDocumentFragment();

        for (
            let index = 0;
            index < this.particleAmount;
            index += 1
        ) {
            const pair =
                this.createParticlePair();

            pair.forEach((particle) => {
                this.particles.push(particle);
                fragment.appendChild(particle);
            });
        }

        this.particleContainer.appendChild(
            fragment
        );
    }

    createParticlePair() {
        const width =
            this.randomBetween(18, 72);

        const height =
            this.randomBetween(1, 3);

        const top =
            this.randomBetween(5, 92);

        const duration =
            this.randomBetween(2.1, 4.8);

        const opacity =
            this.randomBetween(0.1, 0.3);

        const delay =
            this.randomBetween(-7, 0);

        const left =
            this.createParticle({
                side: "left",
                width,
                height,
                top,
                duration,
                opacity,
                delay
            });

        const right =
            this.createParticle({
                side: "right",
                width,
                height,
                top,
                duration,
                opacity,
                delay
            });

        return [left, right];
    }

    createParticle({
        side,
        width,
        height,
        top,
        duration,
        opacity,
        delay
    }) {
        const particle =
            document.createElement("span");

        particle.className =
            `tech-particle anime-streak anime-streak-${side}`;

        particle.style.width =
            `${width}px`;

        particle.style.height =
            `${height}px`;

        particle.style.top =
            `${top}%`;

        particle.style.setProperty(
            "--particle-duration",
            `${duration}s`
        );

        particle.style.setProperty(
            "--particle-opacity",
            opacity
        );

        particle.style.animationDelay =
            `${delay}s`;

        return particle;
    }

    setIntensity(intensity) {
        const normalizedIntensity =
            Math.min(
                1.5,
                Math.max(0, intensity)
            );

        this.intensity =
            normalizedIntensity;

        this.root.style.setProperty(
            "--background-intensity",
            normalizedIntensity
        );
    }

    getIntensity() {
        return this.intensity;
    }

    flash({
        intensity = 1.35,
        duration = 700
    } = {}) {
        window.clearTimeout(
            this.flashTimer
        );

        const previousIntensity =
            this.intensity;

        this.root.classList.remove(
            "is-flashing"
        );

        void this.root.offsetWidth;

        this.root.style.setProperty(
            "--flash-intensity",
            intensity
        );

        this.root.classList.add(
            "is-flashing"
        );

        this.flashTimer =
            window.setTimeout(() => {
                this.root.classList.remove(
                    "is-flashing"
                );

                this.setIntensity(
                    previousIntensity
                );
            }, duration);
    }

    reset() {
        this.destroy();
        this.initialize();
    }

    destroy() {
        window.clearTimeout(
            this.flashTimer
        );

        this.shapes.forEach((shape) => {
            shape.remove();
        });

        this.particles.forEach((particle) => {
            particle.remove();
        });

        this.root.classList.remove(
            "is-flashing"
        );

        this.root.style.removeProperty(
            "--background-intensity"
        );

        this.root.style.removeProperty(
            "--flash-intensity"
        );

        this.shapes = [];
        this.particles = [];

        this.initialized = false;
        this.intensity = 1;
    }

    randomBetween(minimum, maximum) {
        return (
            Math.random() *
            (maximum - minimum) +
            minimum
        );
    }
}

window.Background = Background;
