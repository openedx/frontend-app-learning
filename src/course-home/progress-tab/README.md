# Progress tab

## Data available to plugins

### `useExamsData()`

It reads the progress tab's own data, so it is for widgets rendered in the progress tab's slots, as in the example below. Outside the progress tab it returns `null`, unless something else on the page has loaded the progress tab's data.

#### Example

The following adds a list of the learner's exam attempts below the course grade card. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, useExamsData } from './src';

 import '@openedx/frontend-base/shell/style';

+const ExamAttemptSummary = () => {
+  const examsData = useExamsData();
+  return examsData && (
+    <ul>
+      {examsData.filter((exam) => exam.id).map((exam) => (
+        <li key={exam.id}>{exam.examName}: {exam.attemptStatus}</li>
+      ))}
+    </ul>
+  );
+};
+
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     shellApp,
     headerApp,
     footerApp,
     learningApp,
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.progressTabCourseGrade.v1',
+          id: 'org.example.widget.examAttemptSummary',
+          op: WidgetOperationTypes.APPEND,
+          component: ExamAttemptSummary,
+        },
+      ],
+    },
   ],
 };
```
