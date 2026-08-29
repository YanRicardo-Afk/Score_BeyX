class FontLoader {
    async load(font) {
        if (!font?.family || !font?.source) {
            throw new Error(
                "FontLoader precisa receber family e source."
            );
        }

        const fontFace = new FontFace(
            font.family,
            `url("${font.source}")`,
            font.descriptors ?? {}
        );

        const loadedFont = await fontFace.load();

        document.fonts.add(loadedFont);

        return {
            type: "font",
            source: font.source,
            font: loadedFont
        };
    }
}

window.FontLoader = FontLoader;