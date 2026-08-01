const express = require("express");
const path = require("path");
const http = require("http");

class HttpServer {
    constructor({
        port = 3000,
        publicPath
    } = {}) {
        if (!publicPath) {
            throw new Error(
                "HttpServer precisa receber o caminho da pasta public."
            );
        }

        this.port = port;
        this.publicPath = publicPath;

        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);

        this.started = false;

        this.configureMiddlewares();
        this.configureRoutes();
    }

    configureMiddlewares() {
        this.expressApp.use(
            express.static(this.publicPath)
        );
    }

    configureRoutes() {
        this.expressApp.get("/", (request, response) => {
            response.sendFile(
                path.join(
                    this.publicPath,
                    "scoreboard",
                    "index.html"
                )
            );
        });

        this.expressApp.get("/controller", (request, response) => {
            response.sendFile(
                path.join(
                    this.publicPath,
                    "controller",
                    "index.html"
                )
            );
        });

        this.expressApp.get("/health", (request, response) => {
            response.json({
                status: "ok",
                service: "beyblade-overlay-engine"
            });
        });
    }

    start() {
        if (this.started) {
            throw new Error(
                "O servidor HTTP já foi iniciado."
            );
        }

        return new Promise((resolve, reject) => {
            this.httpServer.once("error", reject);

            this.httpServer.listen(
                this.port,
                "0.0.0.0",
                () => {
                    this.started = true;

                    this.httpServer.removeListener(
                        "error",
                        reject
                    );

                    resolve({
                        port: this.port
                    });
                }
            );
        });
    }

    stop() {
        if (!this.started) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.httpServer.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                this.started = false;
                resolve();
            });
        });
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