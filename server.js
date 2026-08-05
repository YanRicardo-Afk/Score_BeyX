const App = require("./src/core/App");

const PORT = Number(process.env.PORT) || 3000;

const app = new App({
    port: PORT
});

async function bootstrap() {
    try {
        await app.start();

        
        
        console.log(
            `Servidor iniciado em http://localhost:${PORT}`
        );

        console.log(
            `Controller: http://localhost:${PORT}/controller`
        );

        console.log(
            `Health check: http://localhost:${PORT}/health`
        );
    } catch (error) {
        console.error(
            "Não foi possível iniciar a aplicação:",
            error
        );

        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`\nEncerrando aplicação (${signal})...`);

    try {
        if (app.isStarted()) {
            await app.stop();
        }

        process.exit(0);
    } catch (error) {
        console.error(
            "Erro ao encerrar a aplicação:",
            error
        );

        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

bootstrap();

