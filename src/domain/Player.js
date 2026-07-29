const Bey = require("./Bey");

class Player {
    constructor({
        id,
        name,
        bey
    }) {

        if (!(bey instanceof Bey)) {
            throw new Error("Player precisa receber uma instância de Bey.");
        }

        this.id = id;
        this.name = name;
        this.bey = bey;
    }
}

module.exports = Player;