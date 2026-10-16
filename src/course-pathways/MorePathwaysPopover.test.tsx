import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import type { PathwayData } from './data/types';
import { dataEngineering, machineLearning } from './data/__fixtures__/pathways';
import { MorePathwaysPopover } from './MorePathwaysPopover';

const renderComponent = (pathways: PathwayData[] = [dataEngineering, machineLearning]) => render(
  <IntlProvider locale="en">
    <MorePathwaysPopover pathways={pathways} />
  </IntlProvider>,
);

describe('MorePathwaysPopover', () => {
  it('renders the trigger with the number of pathways and an accessible label', () => {
    renderComponent();
    const trigger = screen.getByRole('button', { name: 'Show 2 more pathways' });
    expect(trigger).toHaveTextContent('2');
  });

  it('uses the singular accessible label for a single pathway', () => {
    renderComponent([dataEngineering]);
    expect(screen.getByRole('button', { name: 'Show 1 more pathway' })).toBeInTheDocument();
  });

  it('does not show the pathways until the trigger is clicked', () => {
    renderComponent();
    expect(screen.queryByText('Data Engineering Fundamentals')).not.toBeInTheDocument();
  });

  it('shows the pathways when the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Show 2 more pathways' }));
    expect(screen.getByText('Data Engineering Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
  });

  it('closes the pathways list on Escape', async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Show 2 more pathways' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Data Engineering Fundamentals')).not.toBeInTheDocument();
  });
});
