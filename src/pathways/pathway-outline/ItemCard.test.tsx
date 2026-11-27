import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import type { PathwayItemData } from '@src/pathways/data/types';
import { inProgressItem, notStartedItem } from '@src/pathways/data/__fixtures__/pathwayItems';

import { ItemCard } from './ItemCard';

jest.mock('./course-outline/CourseOutline', () => ({
  CourseOutline: jest.fn(({ courseId }) => <div data-testid="CourseOutline">{courseId}</div>),
}));

const renderComponent = (item: PathwayItemData) => render(
  <IntlProvider locale="en">
    <ItemCard item={item} />
  </IntlProvider>,
);

describe('ItemCard', () => {
  it('shows the begin button for an item that is not started, without an outline toggle', () => {
    renderComponent(notStartedItem);
    expect(screen.getByRole('button', { name: 'Begin course' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show outline' })).not.toBeInTheDocument();
  });

  it('shows the status of a started item with its outline closed', () => {
    renderComponent(inProgressItem);
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show outline' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('CourseOutline')).not.toBeInTheDocument();
  });

  it('toggles the outline of the course of a started item', async () => {
    renderComponent(inProgressItem);

    await userEvent.click(screen.getByRole('button', { name: 'Show outline' }));
    const hideButton = screen.getByRole('button', { name: 'Hide outline' });
    expect(hideButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('CourseOutline')).toHaveTextContent(inProgressItem.id);

    await userEvent.click(hideButton);
    expect(screen.getByRole('button', { name: 'Show outline' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('CourseOutline')).not.toBeInTheDocument();
  });
});
