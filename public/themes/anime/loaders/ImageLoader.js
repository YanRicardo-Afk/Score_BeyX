class ImageLoader {
    async load(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                resolve({
                    type: "image",
                    source,
                    element: image
                });
            };

            image.onerror = () => {
                reject(
                    new Error(
                        `Não foi possível carregar a imagem: ${source}`
                    )
                );
            };

            image.src = source;
        });
    }
}

window.ImageLoader = ImageLoader;