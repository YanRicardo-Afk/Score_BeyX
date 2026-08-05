class Deck {
    constructor({
        slots,
        activeIndex = 0
    }) {
        if (!Array.isArray(slots)) {
            throw new Error(
                "O Deck precisa receber uma lista de Beys."
            );
        }

        if (slots.length === 0) {
            throw new Error(
                "O Deck precisa possuir pelo menos um Bey."
            );
        }

        if (slots.length > 3) {
            throw new Error(
                "O Deck pode possuir no máximo 3 Beys."
            );
        }

        const hasInvalidBey = slots.some(
            (bey) =>
                !bey ||
                typeof bey.id !== "string" ||
                typeof bey.name !== "string"
        );

        if (hasInvalidBey) {
            throw new Error(
                "Todos os slots do Deck precisam conter Beys válidos."
            );
        }

        const ids = slots.map((bey) => bey.id);

        const hasDuplicate =
            new Set(ids).size !== ids.length;

        if (hasDuplicate) {
            throw new Error(
                "O Deck não pode possuir Beys repetidos."
            );
        }

        if (
            !Number.isInteger(activeIndex) ||
            activeIndex < 0 ||
            activeIndex >= slots.length
        ) {
            throw new Error(
                "O índice do Bey ativo é inválido."
            );
        }

        this.slots = [...slots];
        this.activeIndex = activeIndex;
    }

    get current() {
        return this.slots[this.activeIndex];
    }

    get size() {
        return this.slots.length;
    }

    getAll() {
        return [...this.slots];
    }

    getByIndex(index) {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.slots.length
        ) {
            return null;
        }

        return this.slots[index];
    }

    has(beyId) {
        return this.slots.some(
            (bey) => bey.id === beyId
        );
    }

    setActive(index) {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.slots.length
        ) {
            throw new Error(
                "Não foi possível selecionar o Bey: índice inválido."
            );
        }

        this.activeIndex = index;

        return this.current;
    }

    setActiveById(beyId) {
        const index = this.slots.findIndex(
            (bey) => bey.id === beyId
        );

        if (index === -1) {
            throw new Error(
                `O Bey "${beyId}" não pertence a este Deck.`
            );
        }

        return this.setActive(index);
    }

    reset() {
        this.activeIndex = 0;

        return this.current;
    }
}

module.exports = Deck;