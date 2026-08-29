const PrototypeBaseAssets = Object.freeze({
    images: [],

    fonts: [],

    audio: [],

    videos: []
});

function createPrototypeAssets(battle = null) {
    const images = [];

    if (battle) {
        const battleImages = [
            battle.player1?.bey?.image,
            battle.player2?.bey?.image
        ];

        battleImages.forEach((image) => {
            if (
                image &&
                !images.includes(image)
            ) {
                images.push(image);
            }
        });
    }

    return {
        images,

        fonts: [
            ...PrototypeBaseAssets.fonts
        ],

        audio: [
            ...PrototypeBaseAssets.audio
        ],

        videos: [
            ...PrototypeBaseAssets.videos
        ]
    };
}

window.PrototypeBaseAssets =
    PrototypeBaseAssets;

window.createPrototypeAssets =
    createPrototypeAssets;