export const IFRAME_PLUGIN = 'IFRAME_PLUGIN'; // loads iframe at the URL, rather than loading a JS file.
export const DIRECT_PLUGIN = 'DIRECT_PLUGIN';

// Plugin lifecycle events
export const PLUGIN_MOUNTED = 'PLUGIN_MOUNTED';
export const PLUGIN_READY = 'PLUGIN_READY';
export const PLUGIN_UNMOUNTED = 'PLUGIN_UNMOUNTED';
export const PLUGIN_RESIZE = 'PLUGIN_RESIZE';

/**
 * @description PLUGIN_OPERATIONS defines the changes to be made to either the default widget(s) or to any
 * that are inserted
 * @property {string} Insert - inserts a new widget into the DirectPluginSlot
 * @property {string} Hide - used to hide a default widget based on the widgetId
 * @property {string} Modify - used to modify/replace a widget's content
 * @property {string} Wrap - wraps a widget with a React element or fragment
 *
 */
export const PLUGIN_OPERATIONS = {
  Insert: 'insert',
  Hide: 'hide',
  Modify: 'modify',
  Wrap: 'wrap',
};
