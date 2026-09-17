# Progress tab

## Data available to plugins

### `useExamsData()`

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
