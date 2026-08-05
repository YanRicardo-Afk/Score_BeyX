const Deck = require("./Deck");

class Player {
    constructor({
        id,
        name,
        deck
    }) {
        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            throw new Error(
                "O Player precisa receber um id válido."
            );
        }

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            throw new Error(
                "O Player precisa receber um nome válido."
            );
        }

        if (!(deck instanceof Deck)) {
            throw new Error(
                "O Player precisa receber um Deck válido."
            );
        }

        this.id = id.trim();
        this.name = name.trim();
        this.deck = deck;
    }

    get bey() {
        return this.deck.current;
    }

    get activeBey() {
        return this.deck.current;
    }

    setActiveBey(index) {
        return this.deck.setActive(index);
    }

    setActiveBeyById(beyId) {
        return this.deck.setActiveById(beyId);
    }

    resetDeck() {
        return this.deck.reset();
    }
}

module.exports = Player;