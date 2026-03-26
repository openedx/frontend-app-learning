/**
 * Check if the upgrade widget should be shown for the current course/unit context.
 *
 * @param {Object} context
 * @param {Object|null} context.verifiedMode - Verified mode data from courseHomeMeta model
 * @returns {boolean}
 */
export const upgradeIsAvailable = ({ verifiedMode }) => !!verifiedMode;
