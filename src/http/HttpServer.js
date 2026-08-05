const express = require("express");
const path = require("path");
const http = require("http");

const createApiRouter = require(
    "./routes/api"
);

class HttpServer {
    constructor({
        port = 3000,
        publicPath,
        beyCatalog,
        battleFactory,
        battleManager
    } = {}) {
        if (!publicPath) {
            throw new Error(
                "HttpServer precisa receber o caminho da pasta public."
            );
        }

        if (!beyCatalog) {
            throw new Error(
                "HttpServer precisa receber um BeyCatalog."
            );
        }

        if (!battleFactory) {
            throw new Error(
                "HttpServer precisa receber um BattleFactory."
            );
        }

        if (!battleManager) {
            throw new Error(
                "HttpServer precisa receber um BattleManager."
            );
        }

        this.port = port;
        this.publicPath = publicPath;

        this.beyCatalog = beyCatalog;
        this.battleFactory = battleFactory;
        this.battleManager = battleManager;

        this.expressApp = express();

        this.httpServer =
            http.createServer(
                this.expressApp
            );

        this.started = false;

        this.configureMiddlewares();
        this.configureRoutes();
    }

    configureMiddlewares() {
        this.expressApp.use(
            express.json()
        );

        this.expressApp.use(
            express.static(
                this.publicPath
            )
        );
    }

    configureRoutes() {
        const apiRouter =
            createApiRouter({
                beyCatalog:
                    this.beyCatalog,

                battleFactory:
                    this.battleFactory,

                battleManager:
                    this.battleManager
            });

        this.expressApp.use(
            "/api",
            apiRouter
        );

        this.expressApp.get(
            "/",
            (request, response) => {
                response.sendFile(
                    path.join(
                        this.publicPath,
                        "scoreboard",
                        "index.html"
                    )
                );
            }
        );

        this.expressApp.get(
            "/controller",
            (request, response) => {
                response.sendFile(
                    path.join(
                        this.publicPath,
                        "controller",
                        "index.html"
                    )
                );
            }
        );

        this.expressApp.get(
            "/themes/prototype",
            (request, response) => {
                response.sendFile(
                    path.join(
                        this.publicPath,
                        "themes",
                        "prototype",
                        "index.html"
                    )
                );
            }
        );

        this.expressApp.get(
            "/health",
            (request, response) => {
                response.json({
                    status: "ok",
                    service:
                        "beyblade-overlay-engine"
                });
            }
        );
    }

    start() {
        if (this.started) {
            throw new Error(
                "O servidor HTTP já foi iniciado."
            );
        }

        return new Promise(
            (resolve, reject) => {
                this.httpServer.once(
                    "error",
                    reject
                );

                this.httpServer.listen(
                    this.port,
                    "0.0.0.0",
                    () => {
                        this.started = true;

                        this.httpServer
                            .removeListener(
                                "error",
                                reject
                            );

                        resolve({
                            port: this.port
                        });
                    }
                );
            }
        );
    }

    stop() {
        if (!this.started) {
            return Promise.resolve();
        }

        return new Promise(
            (resolve, reject) => {
                this.httpServer.close(
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        this.started = false;
                        resolve();
                    }
                );
            }
        );
    }

    getHttpServer() {
        return this.httpServer;
    }

    getExpressApp() {
        return this.expressApp;
    }

    isStarted() {
        return this.started;
    }
}

module.exports = HttpServer;