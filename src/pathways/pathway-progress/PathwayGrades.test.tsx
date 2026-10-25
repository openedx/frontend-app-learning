import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { dataEngineeringProgress } from '@src/pathways/data/__fixtures__/pathways';

import { PathwayGrades } from './PathwayGrades';

const { grades } = dataEngineeringProgress;

const renderComponent = () => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <PathwayGrades grades={grades} />
    </MemoryRouter>
  </IntlProvider>,
);

const getRow = (displayName: string) => screen.getByRole('row', { name: new RegExp(displayName) });

describe('PathwayGrades', () => {
  it('shows a row with the progress and grades of each course as percentages', () => {
    renderComponent();

    // The header row plus one row per grade.
    expect(screen.getAllByRole('row')).toHaveLength(grades.length + 1);

    const row = within(getRow('Data Pipelines'));
    expect(row.getByText('40%')).toBeInTheDocument();
    expect(row.getByText('70%')).toBeInTheDocument();
    expect(row.getByText('30%')).toBeInTheDocument();
  });

  it('links each course to its grade details', () => {
    renderComponent();

    grades.forEach(({ displayName, detailsUrl }) => {
      expect(within(getRow(displayName)).getByRole('link', { name: 'View details' }))
        .toHaveAttribute('href', detailsUrl);
    });
  });
});
