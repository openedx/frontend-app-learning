import siteConfig from 'site.config';
import { mergeSiteConfig } from '@openedx/frontend-base';
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

mergeSiteConfig(siteConfig);

failOnConsole({
  silenceMessage: (message) => {
    const patternsToSilence = [
      // https://github.com/openedx/frontend-base/issues/325
      /^⚠️ React Router Future Flag Warning: .*`v7_startTransition`/,
      /^⚠️ React Router Future Flag Warning: .*`v7_relativeSplatPath`/,
    ];
    return patternsToSilence.some((pattern) => pattern.test(message));
  },
});
