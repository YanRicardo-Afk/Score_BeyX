const FinishTypes = require("../shared/enums/FinishTypes");

const Rules = Object.freeze({
    WIN_SCORE: 4,

    FINISH_POINTS: Object.freeze({
        [FinishTypes.SPIN]: 1,
        [FinishTypes.OVER]: 2,
        [FinishTypes.BURST]: 2,
        [FinishTypes.XTREME]: 3
    })
});

module.exports = Rules;