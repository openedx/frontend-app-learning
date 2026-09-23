# Progress tab

## Data available to plugins

### `useExamsData()`

It reads the progress tab's own data, so it is for widgets rendered in the progress tab's slots, as in the example below. Outside the progress tab it returns `null` unless something rendered on the page fetches that data — for example, a widget calling `useProgressTabData(courseId)` from `./src/course-home/data/apiHooks`.

#### Example

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { useExamsData } from './src/course-home/progress-tab/hooks';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.progress_tab_course_grade.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'exam_attempt_summary',
            type: DIRECT_PLUGIN,
            RenderWidget: () => {
              const examsData = useExamsData();
              return examsData && (
                <ul>
                  {examsData.filter((exam) => exam.id).map((exam) => (
                    <li key={exam.id}>{exam.examName}: {exam.attemptStatus}</li>
                  ))}
                </ul>
              );
            },
          },
        },
      ],
    },
  },
};

export default config;
```
