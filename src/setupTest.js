import { addAppConfigs, initializeMockApp, mergeSiteConfig } from '@openedx/frontend-base';
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

import './courseware/data/__factories__';
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
      // https://github.com/openedx/paragon/issues/3043
      /^Warning: (AlertModal|CardItem|CardView|CollapsibleBody|CollapsibleTrigger|CollapsibleVisible|DataTable|DataTableLayout|FormControlDecorator|FormControlDecoratorGroup|MarketingModal|ModalDialogBody|ModalDialogFooter|ModalDialogHero|ModalDialogHeroBackground|ModalDialogHeroContent|ModalDialogTitle|ModalPopup|PopoverContent|PopperElement|SearchFieldAdvanced|SearchFieldInput|SearchFieldLabel|SearchFieldSubmitButton|StandardModal|StatefulButton|Table|TableFooter|Tabs): Support for defaultProps will be removed from function components/,
      // react-share 4.x: its icon components declare defaultProps. 5.x does not, but drops the Facebook `quote` param.
      /^Warning: Icon: Support for defaultProps will be removed from function components/,
      // @edx/frontend-lib-special-exams 5.x: its own components declare defaultProps.
      /^Warning: (Exam|ExamWrapper|LtiProviderExamInstructions|RestProviderInstructions): Support for defaultProps will be removed from function components/,
      // https://github.com/openedx/paragon/issues/4523
      /^Warning: (Overlay|OverlayTrigger): Support for defaultProps will be removed from function components/,
      // https://github.com/openedx/paragon/issues/3425
      /^Warning: findDOMNode is deprecated and will be removed in the next major release\./,
    ];
    return patternsToSilence.some((pattern) => pattern.test(message));
  },
});
