const path = require("path");

const EventBus = require("./EventBus");
const BattleManager = require("./BattleManager");
const HttpServer = require("../http/HttpServer");

const Events = require("../shared/Events");

class App {
    constructor({
        port = 3000
    } = {}) {
        this.port = port;

        this.eventBus = null;
        this.battleManager = null;
        this.httpServer = null;

        this.started = false;
    }

    async start() {
        if (this.started) {
            throw new Error(
                "A aplicação já foi iniciada."
            );
        }

        this.eventBus = new EventBus();

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

        await this.httpServer.start();

        this.started = true;

        this.eventBus.emit(Events.APP_STARTED, {
            port: this.port,
            startedAt: new Date()
        });

        return this;
    }

    async stop() {
        this.requireStarted();

        if (this.battleManager.hasCurrentBattle()) {
            this.battleManager.removeBattle();
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