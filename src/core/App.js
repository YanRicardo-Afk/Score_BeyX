const path = require("path");

const EventBus = require("./EventBus");
const BattleManager = require("./BattleManager");

const HttpServer = require("../http/HttpServer");
const SocketManager = require("../socket/SocketManager");

const Deck = require("../domain/Deck");
const Player = require("../domain/Player");

const BeyCatalog = require("../catalog/BeyCatalog");

const Events = require("../shared/Events");

class App {
    constructor({
        port = 3000
    } = {}) {
        this.port = port;

        this.eventBus = null;
        this.battleManager = null;
        this.httpServer = null;
        this.socketManager = null;
        this.beyCatalog = null;

        this.started = false;
    }

    async start() {
        if (this.started) {
            throw new Error(
                "A aplicação já foi iniciada."
            );
        }

        this.eventBus = new EventBus();

        this.beyCatalog = new BeyCatalog();

        this.battleManager = new BattleManager({
            eventBus: this.eventBus
        });

        this.httpServer = new HttpServer({
            port: this.port,
            publicPath: path.join(
                __dirname,
                "../../public"
            )
        });

        this.socketManager = new SocketManager({
            httpServer:
                this.httpServer.getHttpServer(),
            eventBus: this.eventBus,
            battleManager: this.battleManager
        });

        this.createDefaultBattle();

        await this.httpServer.start();

        this.started = true;

        this.eventBus.emit(Events.APP_STARTED, {
            port: this.port,
            startedAt: new Date()
        });

        return this;
    }

    createDefaultBattle() {
        const player1Deck = new Deck({
            slots: [
                this.beyCatalog.getById(
                    "dran-sword"
                )
            ]
        });

        const player2Deck = new Deck({
            slots: [
                this.beyCatalog.getById(
                    "storm-pegasis"
                )
            ]
        });

        const player1 = new Player({
            id: "player-1",
            name: "Jogador 1",
            deck: player1Deck
        });

        const player2 = new Player({
            id: "player-2",
            name: "Jogador 2",
            deck: player2Deck
        });

        this.battleManager.createBattle({
            id: "battle-1",
            player1,
            player2
        });
    }

    async stop() {
        this.requireStarted();

        if (
            this.battleManager.hasCurrentBattle()
        ) {
            this.battleManager.removeBattle();
        }

        if (this.socketManager) {
            await this.socketManager.close();
        }

        await this.httpServer.stop();

        this.eventBus.emit(Events.APP_STOPPED, {
            stoppedAt: new Date()
        });

        this.started = false;
    }

    getEventBus() {
        this.requireStarted();

        return this.eventBus;
    }

    getBattleManager() {
        this.requireStarted();

        return this.battleManager;
    }

    getHttpServer() {
        this.requireStarted();

        return this.httpServer;
    }

    getSocketManager() {
        this.requireStarted();

        return this.socketManager;
    }

    getBeyCatalog() {
        this.requireStarted();

        return this.beyCatalog;
    }

    isStarted() {
        return this.started;
    }

    requireStarted() {
        if (!this.started) {
            throw new Error(
                "A aplicação precisa ser iniciada primeiro."
            );
        }
    }
}

module.exports = App;