import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';

import { fireEvent } from '@testing-library/dom';
import GradeSummaryHeader from './GradeSummaryHeader';
import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

jest.mock('../../../../data/hooks', () => ({
  useContextId: () => 'test-course-id',
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
          allOfSomeAssignmentTypeIsLocked={false}
          {...props}
        />
      </IntlProvider>,
    );
  };

  it('shows tooltip on icon button click', async () => {
    renderComponent();

    const iconButton = screen.getByRole('button', {
      name: messages.gradeSummaryTooltipAlt.defaultMessage,
    });

    await userEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeInTheDocument();
    });
  });

  it('hides tooltip on click', async () => {
    renderComponent();

    const iconButton = screen.getByRole('button', {
      name: messages.gradeSummaryTooltipAlt.defaultMessage,
    });

    fireEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeVisible();
    });

    fireEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.queryByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeNull();
    });
  });

  it('hides tooltip on blur', async () => {
    renderComponent();

    const iconButton = screen.getByRole('button', {
      name: messages.gradeSummaryTooltipAlt.defaultMessage,
    });

    await userEvent.hover(iconButton);
    await userEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeInTheDocument();
    });

    const blurTarget = document.createElement('button');
    blurTarget.textContent = 'Outside';
    document.body.appendChild(blurTarget);
    blurTarget.focus();

    await userEvent.unhover(iconButton);

    await waitFor(() => {
      expect(screen.queryByText(messages.gradeSummaryTooltipBody.defaultMessage)).not.toBeInTheDocument();
    });

    document.body.removeChild(blurTarget);
  });

  it('hides tooltip when Escape is pressed (covers handleKeyDown)', async () => {
    renderComponent();

    const iconButton = screen.getByRole('button', {
      name: messages.gradeSummaryTooltipAlt.defaultMessage,
    });

    await userEvent.hover(iconButton);
    await userEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeInTheDocument();
    });

    fireEvent.keyDown(iconButton, { key: 'Escape', code: 'Escape' });

    await userEvent.unhover(iconButton);

    await waitFor(() => {
      expect(screen.queryByText(messages.gradeSummaryTooltipBody.defaultMessage)).not.toBeInTheDocument();
    });
  });
});
