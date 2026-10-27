import { addAppConfigs, initializeMockApp, mergeSiteConfig } from '@openedx/frontend-base';
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

import './course-home/data/__factories__';
import learningApp from './app';
import { authenticatedUser } from './tests/authenticatedUser';
import { restoreLocation } from './tests/location';

initializeMockApp({ authenticatedUser });
mergeSiteConfig({ apps: [learningApp] });
addAppConfigs();

afterEach(restoreLocation);

failOnConsole({
  silenceMessage: (message) => {
    const patternsToSilence = [
      // https://github.com/openedx/frontend-base/issues/325
      /^⚠️ React Router Future Flag Warning: .*`v7_startTransition`/,
      /^⚠️ React Router Future Flag Warning: .*`v7_relativeSplatPath`/,
      // https://github.com/openedx/paragon/issues/4523
      /^Warning: (Overlay|OverlayTrigger): Support for defaultProps will be removed from function components/,
      // https://github.com/openedx/paragon/issues/3425
      /^Warning: findDOMNode is deprecated and will be removed in the next major release\./,
    ];
    return patternsToSilence.some((pattern) => pattern.test(message));
  },
});
