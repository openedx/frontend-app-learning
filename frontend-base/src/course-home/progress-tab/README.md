# Progress tab

## Data available to plugins

### `useExamsData()`

It reads the progress tab's own data, so it is for widgets rendered in the progress tab's slots, as in the example below. Outside the progress tab it returns `null` unless something rendered on the page fetches that data — for example, a widget calling `useProgressTabData(courseId)` from `./src/course-home/data/apiHooks`.

#### Example

The widget example comes with the Slot API port: https://github.com/openedx/frontend-app-learning/issues/2185
