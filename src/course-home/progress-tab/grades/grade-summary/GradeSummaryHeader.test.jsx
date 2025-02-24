import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';

import GradeSummaryHeader from './GradeSummaryHeader';
import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

describe('GradeSummaryHeader', () => {
  beforeEach(() => {
    useSelector.mockImplementation((selector) => selector({
      courseHome: { courseId: 'test-course-id' },
    }));
    useModel.mockReturnValue({ gradesFeatureIsFullyLocked: false });
  });

  const renderComponent = (props = {}) => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <GradeSummaryHeader
          intl={{ formatMessage: jest.fn((msg) => msg.defaultMessage) }}
          allOfSomeAssignmentTypeIsLocked={false}
          {...props}
        />
      </IntlProvider>,
    );
  };

  it('visible the tooltip when Escape is pressed', async () => {
    renderComponent();

    const iconButton = screen.getByRole('button', {
      name: messages.gradeSummaryTooltipAlt.defaultMessage,
    });

    userEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeVisible();
    });
  });
});
