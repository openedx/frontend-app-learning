/**
 * Check if the upgrade widget should be shown for the current course/unit context.
 *
 * @param {Object} context
 * @param {Object} context.course - Merged coursewareMeta + courseHomeMeta for the current course
 * @returns {boolean}
 */
export const upgradeIsAvailable = ({ course }) => !!course?.verifiedMode;
