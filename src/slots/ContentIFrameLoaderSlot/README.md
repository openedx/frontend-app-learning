# Content IFrame Loader Slot

### Slot ID: `org.openedx.frontend.slot.learning.contentIFrameLoader.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `unitId: string` - the ID of the unit whose content is loading.
* `loadingMessage: ReactNode` - the message for screen readers while the content loads.

## Description

This slot renders the loading indicator shown while a unit's content loads in its iframe, until the content reports its height. Its default content is `PageLoading`, a spinner with `loadingMessage` as its screen reader text.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the spinner with a message that names the course. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { Spinner } from '@openedx/paragon';

-import { learningApp } from './src';
+import { learningApp, type ContentIFrameLoaderSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const CustomLoader = ({ courseId, loadingMessage }: ContentIFrameLoaderSlotProps) => (
+  <div style={{ textAlign: 'center', padding: '2rem' }}>
+    <h3>Loading course content...</h3>
+    <p>Course: {courseId}</p>
+    <Spinner animation="border" screenReaderText={loadingMessage} />
+    <p>Please wait while we prepare your learning experience</p>
+  </div>
+);
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
+          slotId: 'org.openedx.frontend.slot.learning.contentIFrameLoader.v1',
+          id: 'org.example.widget.customLoader',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: CustomLoader,
+        },
+      ],
+    },
   ],
 };
```

In the legacy app this slot also passed `defaultLoaderComponent`, the default spinner, for a widget to render inside its own. That prop is gone: keep the default content and add your widget beside it with `INSERT_BEFORE` or `INSERT_AFTER` on `defaultContent` instead.
