import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';

import { useModel } from '@src/generic/model-store';
import {
  initializeMockApp, render, screen, waitFor,
} from '@src/setupTest';
import GradeSummaryHeader from './GradeSummaryHeader';
import messages from '../messages';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  useContextId: () => 'test-course-id',
}));

describe('GradeSummaryHeader', () => {
  beforeAll(() => {
    initializeMockApp();
  });

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

    await userEvent.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText(messages.gradeSummaryTooltipBody.defaultMessage)).toBeVisible();
    });

    await userEvent.click(iconButton);

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

    await userEvent.click(blurTarget);

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

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText(messages.gradeSummaryTooltipBody.defaultMessage)).not.toBeInTheDocument();
    });
  });
});
