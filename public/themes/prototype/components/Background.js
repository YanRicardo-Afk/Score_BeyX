class Background {
    constructor({ container, amount = 18 }) {
        if (!(container instanceof HTMLElement)) {
            throw new Error("Background precisa receber um elemento HTML válido.");
        }

        this.container = container;
        this.amount = amount;
        this.shapes = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        this.createShapes();
        this.initialized = true;
    }

    createShapes() {
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < this.amount; index += 1) {
            const shape = this.createShape();
            this.shapes.push(shape);
            fragment.appendChild(shape);
        }

        this.container.appendChild(fragment);
    }

    createShape() {
        const shape = document.createElement("span");
        const width = this.randomBetween(55, 220);
        const height = this.randomBetween(24, 130);

        shape.className = "tech-shape";
        shape.style.width = `${width}px`;
        shape.style.height = `${height}px`;
        shape.style.left = `${this.randomBetween(-10, 95)}%`;
        shape.style.top = `${this.randomBetween(-20, 100)}%`;
        shape.style.setProperty("--duration", `${this.randomBetween(14, 34)}s`);
        shape.style.animationDelay = `${this.randomBetween(-24, 0)}s`;

        return shape;
    }

    reset() {
        this.destroy();
        this.initialize();
    }

    destroy() {
        this.shapes.forEach((shape) => shape.remove());
        this.shapes = [];
        this.initialized = false;
    }

    randomBetween(minimum, maximum) {
        return Math.random() * (maximum - minimum) + minimum;
    }
}

window.Background = Background;