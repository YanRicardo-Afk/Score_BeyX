class Background {
    constructor({
        container,
        particleContainer,
        root,
        amount = 18,
        particleAmount = 26
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

        this.amount = amount;
        this.particleAmount = particleAmount;

        this.shapes = [];
        this.particles = [];

        this.initialized = false;
        this.intensity = 1;
        this.flashTimer = null;

        this.shapeTypes = [
            "outline",
            "solid",
            "bar",
            "module",
            "double"
        ];
    }

    initialize() {
        if (this.initialized) {
            return;
        }

        this.createShapes();
        this.createParticles();
        this.setIntensity(1);

        this.initialized = true;
    }

    createShapes() {
        const fragment =
            document.createDocumentFragment();

        for (
            let index = 0;
            index < this.amount;
            index += 1
        ) {
            const shape = this.createShape(index);

            this.shapes.push(shape);
            fragment.appendChild(shape);
        }

        this.container.appendChild(fragment);
    }

    createShape(index) {
        const shape = document.createElement("span");

        const type =
            this.shapeTypes[
                index % this.shapeTypes.length
            ];

        const dimensions =
            this.getShapeDimensions(type);

        shape.className =
            `tech-shape tech-shape-${type}`;

        shape.dataset.shapeType = type;

        shape.style.width =
            `${dimensions.width}px`;

        shape.style.height =
            `${dimensions.height}px`;

        shape.style.left =
            `${this.randomBetween(-10, 95)}%`;

        shape.style.top =
            `${this.randomBetween(-20, 100)}%`;

        shape.style.setProperty(
            "--duration",
            `${this.randomBetween(14, 34)}s`
        );

        shape.style.setProperty(
            "--shape-rotation",
            `${this.randomBetween(-8, 8)}deg`
        );

        shape.style.setProperty(
            "--shape-opacity",
            this.randomBetween(0.3, 0.78)
        );

        shape.style.animationDelay =
            `${this.randomBetween(-24, 0)}s`;

        if (type === "double") {
            const detail =
                document.createElement("span");

            detail.className =
                "tech-shape-detail";

            shape.appendChild(detail);
        }

        return shape;
    }

    getShapeDimensions(type) {
        const dimensions = {
            outline: {
                width: this.randomBetween(72, 220),
                height: this.randomBetween(36, 120)
            },

            solid: {
                width: this.randomBetween(44, 150),
                height: this.randomBetween(28, 88)
            },

            bar: {
                width: this.randomBetween(100, 280),
                height: this.randomBetween(5, 14)
            },

            module: {
                width: this.randomBetween(18, 58),
                height: this.randomBetween(18, 58)
            },

            double: {
                width: this.randomBetween(90, 210),
                height: this.randomBetween(30, 82)
            }
        };

        return dimensions[type];
    }

    createParticles() {
        const fragment =
            document.createDocumentFragment();

        for (
            let index = 0;
            index < this.particleAmount;
            index += 1
        ) {
            const particle =
                this.createParticle();

            this.particles.push(particle);
            fragment.appendChild(particle);
        }

        this.particleContainer.appendChild(
            fragment
        );
    }

    createParticle() {
        const particle =
            document.createElement("span");

        const size =
            this.randomBetween(2, 6);

        particle.className =
            "tech-particle";

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left =
            `${this.randomBetween(0, 100)}%`;

        particle.style.top =
            `${this.randomBetween(0, 100)}%`;

        particle.style.setProperty(
            "--particle-duration",
            `${this.randomBetween(10, 24)}s`
        );

        particle.style.setProperty(
            "--particle-drift-x",
            `${this.randomBetween(-40, 40)}px`
        );

        particle.style.setProperty(
            "--particle-drift-y",
            `${this.randomBetween(-90, -28)}px`
        );

        particle.style.animationDelay =
            `${this.randomBetween(-20, 0)}s`;

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