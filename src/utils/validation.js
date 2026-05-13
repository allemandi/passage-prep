import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

/**
 * Checks if a string contains profanity.
 * @param {string} text - The text to check.
 * @returns {boolean} True if profanity is detected, false otherwise.
 */
export const hasProfanity = (text) => {
    if (!text) return false;
    return matcher.hasMatch(text);
};

export default {
    hasProfanity,
};
