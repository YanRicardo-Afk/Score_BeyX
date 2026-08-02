class AudioLoader {
    async load(source) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();

            const handleReady = () => {
                cleanup();

                resolve({
                    type: "audio",
                    source,
                    element: audio
                });
            };

            const handleError = () => {
                cleanup();

                reject(
                    new Error(
                        `Não foi possível carregar o áudio: ${source}`
                    )
                );
            };

            const cleanup = () => {
                audio.removeEventListener(
                    "canplaythrough",
                    handleReady
                );

                audio.removeEventListener(
                    "error",
                    handleError
                );
            };

            audio.preload = "auto";

            audio.addEventListener(
                "canplaythrough",
                handleReady,
                { once: true }
            );

            audio.addEventListener(
                "error",
                handleError,
                { once: true }
            );

            audio.src = source;
            audio.load();
        });
    }
}

window.AudioLoader = AudioLoader;