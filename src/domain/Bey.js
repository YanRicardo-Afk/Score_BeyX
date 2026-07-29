class Bey {
    constructor({
        id,
        name,
        color,
        image = null
    }) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.image = image;
    }
}

module.exports = Bey;