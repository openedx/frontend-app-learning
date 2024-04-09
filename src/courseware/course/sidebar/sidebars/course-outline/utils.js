import { getConfig } from '@edx/frontend-platform';

import {
  OUTLINE_SIDEBAR_DESKTOP_PLUGIN_SLOT_ID,
  OUTLINE_SIDEBAR_MOBILE_PLUGIN_SLOT_ID,
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const checkIsOutlineSidebarAvailable = () => {
  const pluginSlots = getConfig().pluginSlots || {};
  const sidebarPluginSlots = [
    OUTLINE_SIDEBAR_DESKTOP_PLUGIN_SLOT_ID,
    OUTLINE_SIDEBAR_MOBILE_PLUGIN_SLOT_ID,
  ];

  return sidebarPluginSlots.every(
    key => Object.prototype.hasOwnProperty.call(pluginSlots, key) && pluginSlots[key].keepDefault === true,
  );
};
