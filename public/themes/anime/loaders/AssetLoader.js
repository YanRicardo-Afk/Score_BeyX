class AssetLoader {
    constructor({
        assets,
        onProgress = () => {},
        onStatusChange = () => {}
    }) {
        if (!assets) {
            throw new Error(
                "AssetLoader precisa receber uma configuração de assets."
            );
        }

        this.assets = assets;
        this.onProgress = onProgress;
        this.onStatusChange = onStatusChange;

        this.imageLoader = new ImageLoader();
        this.fontLoader = new FontLoader();
        this.audioLoader = new AudioLoader();
        this.videoLoader = new VideoLoader();

        this.loadedAssets = new Map();
        this.errors = [];

        this.loadedCount = 0;
        this.totalCount = this.calculateTotal();
    }

    async loadAll() {
        if (this.totalCount === 0) {
            this.updateProgress();
            return {
                loadedAssets: this.loadedAssets,
                errors: this.errors
            };
        }

        const tasks = [
            ...this.createTasks(
                "images",
                this.assets.images,
                this.imageLoader
            ),

            ...this.createTasks(
                "fonts",
                this.assets.fonts,
                this.fontLoader
            ),

            ...this.createTasks(
                "audio",
                this.assets.audio,
                this.audioLoader
            ),

            ...this.createTasks(
                "videos",
                this.assets.videos,
                this.videoLoader
            )
        ];

        await Promise.all(tasks);

        this.onStatusChange("Preparando HUD...");

        return {
            loadedAssets: this.loadedAssets,
            errors: this.errors
        };
    }

    createTasks(category, items = [], loader) {
        return items.map((item) =>
            this.loadItem({
                category,
                item,
                loader
            })
        );
    }

    async loadItem({
        category,
        item,
        loader
    }) {
        const source =
            typeof item === "string"
                ? item
                : item.source;

        this.onStatusChange(
            `Carregando ${this.getCategoryLabel(category)}...`
        );

        try {
            const result = await loader.load(item);

            this.loadedAssets.set(source, result);
        } catch (error) {
            this.errors.push({
                category,
                source,
                message: error.message
            });

            console.warn(error.message);
        } finally {
            this.loadedCount += 1;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress =
            this.totalCount === 0
                ? 100
                : Math.round(
                    (
                        this.loadedCount /
                        this.totalCount
                    ) * 100
                );

        this.onProgress({
            loaded: this.loadedCount,
            total: this.totalCount,
            progress
        });
    }

    calculateTotal() {
        return (
            (this.assets.images?.length ?? 0) +
            (this.assets.fonts?.length ?? 0) +
            (this.assets.audio?.length ?? 0) +
            (this.assets.videos?.length ?? 0)
        );
    }

    getCategoryLabel(category) {
        const labels = {
            images: "imagens",
            fonts: "fontes",
            audio: "áudios",
            videos: "vídeos"
        };

        return labels[category] ?? "assets";
    }

    get(source) {
        return this.loadedAssets.get(source) ?? null;
    }

    has(source) {
        return this.loadedAssets.has(source);
    }
}

window.AssetLoader = AssetLoader;