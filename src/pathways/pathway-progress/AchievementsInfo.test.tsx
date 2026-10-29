import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { AchievementsInfo } from './AchievementsInfo';

const renderComponent = (hasAchievements: boolean) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <AchievementsInfo pathwayId="pathway-1" hasAchievements={hasAchievements} />
    </MemoryRouter>
  </IntlProvider>,
);

describe('AchievementsInfo', () => {
  it('links to the pathway achievements when the learner has some', () => {
    renderComponent(true);

    expect(screen.getByText('Achievements available')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View achievements' }))
      .toHaveAttribute('href', '/pathway/pathway-1/achievements');
  });

  it('tells the learner there are no achievements yet, without a link', () => {
    renderComponent(false);

    expect(screen.getByText('No achievements earned')).toBeInTheDocument();
    expect(screen.getByText('No certificates earned yet.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
