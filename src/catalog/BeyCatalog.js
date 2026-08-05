const beys = require("./beys");

class BeyCatalog {

    constructor() {

        this.beys = beys;

    }

    getAll() {

        return [...this.beys];

    }

    getById(id) {

        return this.beys.find(
            bey => bey.id === id
        ) || null;

    }

    has(id) {

        return this.getById(id) !== null;

    }

    getByGeneration(generation) {

        return this.beys.filter(
            bey => bey.generation === generation
        );

    }

    getBySeries(series) {

        return this.beys.filter(
            bey => bey.series === series
        );

    }

}

module.exports = BeyCatalog;