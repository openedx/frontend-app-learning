# Unit Content Slot

### Slot ID: `org.openedx.frontend.slot.learning.unitContent.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string` - the ID of the sequence holding the unit.
* `unitId: string` - the ID of the current unit. `ContentIFrame` takes it as `id`.
* `title: string` - the unit title, used as the iframe's title.
* `elementId: string` - the iframe's element ID, `"unit-iframe"`.
* `iframeUrl: string` - the default URL of the unit's content, as `getIFrameUrl(iframeUrlParams)` builds it.
* `iframeUrlParams: IFrameUrlParams` - what the default URL is built from: `id`, `view`, `format`, `examAccess`, `jumpToId` and `preview`.
* `loadingMessage: ReactNode` - the message shown while the content loads.
* `shouldShowContent: boolean` - `false` while the honor code or exam access blocks the content.
* `onLoaded?: () => void` - called once the content has loaded.

## Description

This slot renders the content of a unit, below its title. Its default content is `ContentIFrame`, the iframe that loads the unit from the LMS, with the props above.

When course staff change who they view the course as, the slot's content is mounted again, so that it shows the unit as the LMS now renders it: a replacement needs no code for that.

It is the way to change the iframe's URL. Replace the default content with a component that works out the URL it wants and renders `ContentIFrame` with it, passing everything else on as it came. `ContentIFrame` and `getIFrameUrl` are exported, so a replacement composes the default rather than reimplementing it.

In the legacy app a plugin did this by registering a `getIFrameUrl` override with `registerOverrideMethod` from `src/generic/plugin-overrides`. That registry is gone, and this slot replaces it.

## Examples

### A query parameter the learner picks

The example below adds a `dest_lang` parameter to the URL once the learner picks a language, the way a translations plugin would. Three pieces, all in one plugin app:

1. A provider, registered through the app's `providers`, holds the selected language. The shell mounts it above every app's pages, so the content widget has the value on the first render of every unit.
2. A selector, appended to the unit title slot, sets it.
3. A widget that `REPLACE`s the default content of this slot reads it. A replace is declared once, in the site config, so the widget gates itself: with no language picked, it renders `ContentIFrame` with the props untouched.

The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { createContext, useContext, useState, type ReactNode } from 'react';

-import { learningApp } from './src';
+import { ContentIFrame, learningApp, type UnitContentSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const LanguageContext = createContext<{ language: string | null, setLanguage: (language: string) => void }>({
+  language: null,
+  setLanguage: () => {},
+});
+
+const LanguageProvider = ({ children }: { children?: ReactNode }) => {
+  const [language, setLanguage] = useState<string | null>(null);
+  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
+};
+
+const LanguageSelector = () => {
+  const { setLanguage } = useContext(LanguageContext);
+  return <button type="button" onClick={() => setLanguage('es')}>Español</button>;
+};
+
+const TranslatedContent = (props: UnitContentSlotProps) => {
+  const { language } = useContext(LanguageContext);
+  if (!language) {
+    return <ContentIFrame {...props} id={props.unitId} />;
+  }
+  const url = new URL(props.iframeUrl);
+  url.searchParams.set('dest_lang', language);
+  return <ContentIFrame {...props} id={props.unitId} iframeUrl={url.toString()} />;
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
+      appId: 'org.example.app.translations',
+      providers: [LanguageProvider],
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.unitTitle.v1',
+          id: 'org.example.widget.languageSelector',
+          op: WidgetOperationTypes.APPEND,
+          component: LanguageSelector,
+        },
+        {
+          slotId: 'org.openedx.frontend.slot.learning.unitContent.v1',
+          id: 'org.example.widget.translatedContent',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: TranslatedContent,
+        },
+      ],
+    },
   ],
 };
```

A selector that needs its own configuration first (from an API, say) fetches it itself and renders nothing until it has it. Until a language is picked, the content stays as it was.

To build the URL from different parameters instead of adding to the default one, hand a changed copy of `iframeUrlParams` to `getIFrameUrl`, which is exported too.
