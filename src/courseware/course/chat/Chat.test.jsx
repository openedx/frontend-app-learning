import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import { reducer as learningAssistantReducer } from '@edx/frontend-lib-learning-assistant';

import { initializeMockApp, render, screen } from '../../../setupTest';

import Chat from './Chat';

jest.mock('@edx/frontend-platform/analytics');

initializeMockApp();

const courseId = 'course-v1:edX+DemoX+Demo_Course';
let testCases = [];
let enabledTestCases = [];
let disabledTestCases = [];
const enabledModes = [
  'professional', 'verified', 'no-id-professional', 'credit', 'masters', 'executive-education',
  'paid-executive-education', 'paid-bootcamp', 'audit', 'honor', 'unpaid-executive-education', 'unpaid-bootcamp',
];
const disabledModes = [null, undefined, 'xyz'];

describe('Chat', () => {
  // Generate test cases.
  enabledTestCases = enabledModes.map((mode) => ({ enrollmentMode: mode, isVisible: true }));
  disabledTestCases = disabledModes.map((mode) => ({ enrollmentMode: mode, isVisible: false }));
  testCases = enabledTestCases.concat(disabledTestCases);

  testCases.forEach(test => {
    it(
      `visibility determined by ${test.enrollmentMode} enrollment mode when enabled and not isStaff`,
      async () => {
        const store = configureStore({
          reducer: {
            learningAssistant: learningAssistantReducer,
          },
        });

        render(
          <BrowserRouter>
            <Chat
              enrollmentMode={test.enrollmentMode}
              isStaff={false}
              enabled
              courseId={courseId}
              contentToolsEnabled={false}
            />
          </BrowserRouter>,
          { store },
        );

        const chat = screen.queryByTestId('toggle-button');
        if (test.isVisible) {
          expect(chat).toBeInTheDocument();
        } else {
          expect(chat).not.toBeInTheDocument();
        }
      },
    );
  });

  // Generate test cases.
  testCases = enabledModes.concat(disabledModes).map((mode) => ({ enrollmentMode: mode, isVisible: true }));
  testCases.forEach(test => {
    it('visibility determined by isStaff when enabled and any enrollment mode', async () => {
      const store = configureStore({
        reducer: {
          learningAssistant: learningAssistantReducer,
        },
      });

      render(
        <BrowserRouter>
          <Chat
            enrollmentMode={test.enrollmentMode}
            isStaff
            enabled
            courseId={courseId}
            contentToolsEnabled={false}
          />
        </BrowserRouter>,
        { store },
      );

      const chat = screen.queryByTestId('toggle-button');
      if (test.isVisible) {
        expect(chat).toBeInTheDocument();
      } else {
        expect(chat).not.toBeInTheDocument();
      }
    });
  });

  // Generate the map function used for generating test cases by currying the map function.
  // In this test suite, visibility depends on whether the enrollment mode is a valid or invalid
  // enrollment mode for enabling the Chat when the user is not a staff member and the Chat is enabled. Instead of
  // defining two separate map functions that differ in only one case, curry the function.
  const generateMapFunction = (areEnabledModes) => (
    (mode) => (
      [
        {
          enrollmentMode: mode, isStaff: true, enabled: true, isVisible: true,
        },
        {
          enrollmentMode: mode, isStaff: true, enabled: false, isVisible: false,
        },
        {
          enrollmentMode: mode, isStaff: false, enabled: true, isVisible: areEnabledModes,
        },
        {
          enrollmentMode: mode, isStaff: false, enabled: false, isVisible: false,
        },
      ]
    )
  );

  // Generate test cases.
  enabledTestCases = enabledModes.map(generateMapFunction(true));
  disabledTestCases = disabledModes.map(generateMapFunction(false));
  testCases = enabledTestCases.concat(disabledTestCases);
  testCases = testCases.flat();
  testCases.forEach(test => {
    it(
      `visibility determined by ${test.enabled} enabled when ${test.isStaff} isStaff
      and ${test.enrollmentMode} enrollment mode`,
      async () => {
        const store = configureStore({
          reducer: {
            learningAssistant: learningAssistantReducer,
          },
        });

        render(
          <BrowserRouter>
            <Chat
              enrollmentMode={test.enrollmentMode}
              isStaff={test.isStaff}
              enabled={test.enabled}
              courseId={courseId}
              contentToolsEnabled={false}
            />
          </BrowserRouter>,
          { store },
        );

        const chat = screen.queryByTestId('toggle-button');
        if (test.isVisible) {
          expect(chat).toBeInTheDocument();
        } else {
          expect(chat).not.toBeInTheDocument();
        }
      },
    );
  });
});
