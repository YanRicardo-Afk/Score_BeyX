class VideoLoader {
    async load(source) {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");

            const handleReady = () => {
                cleanup();

                resolve({
                    type: "video",
                    source,
                    element: video
                });
            };

            const handleError = () => {
                cleanup();

                reject(
                    new Error(
                        `Não foi possível carregar o vídeo: ${source}`
                    )
                );
            };

            const cleanup = () => {
                video.removeEventListener(
                    "canplaythrough",
                    handleReady
                );

                video.removeEventListener(
                    "error",
                    handleError
                );
            };

            video.preload = "auto";
            video.muted = true;
            video.playsInline = true;

            video.addEventListener(
                "canplaythrough",
                handleReady,
                { once: true }
            );

            video.addEventListener(
                "error",
                handleError,
                { once: true }
            );

            video.src = source;
            video.load();
        });
    }
}

window.VideoLoader = VideoLoader;