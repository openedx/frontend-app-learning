import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';

import HeaderSlot from '@src/plugin-slots/HeaderSlot';
import { dataEngineering } from '../data/__fixtures__/pathways';
import type { PathwayData } from '../data/types';
import { TabPage } from './TabPage';

jest.mock('@src/plugin-slots/HeaderSlot', () => jest.fn(() => <div>HeaderSlot</div>));
jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: () => <div>FooterSlot</div>,
}));

const buildQuery = (query: Partial<UseQueryResult<PathwayData>>) => ({
  isPending: false,
  isError: false,
  data: undefined,
  error: null,
  ...query,
}) as UseQueryResult<PathwayData>;

const renderComponent = (metadataQuery: UseQueryResult<PathwayData>) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <TabPage
        activeTabSlug="progress"
        pathwayId="pathway-1"
        pathwayStatus={{ metadataQuery }}
      >
        Tab content
      </TabPage>
    </MemoryRouter>
  </IntlProvider>,
);

describe('Pathway TabPage', () => {
  it('shows the loading state while the pathway is loading', () => {
    renderComponent(buildQuery({ isPending: true }));
    expect(screen.getByText('Loading pathway page…')).toBeInTheDocument();
    expect(screen.queryByText('Tab content')).not.toBeInTheDocument();
  });

  it('shows an error when the pathway fails to load', () => {
    renderComponent(buildQuery({ isError: true, error: new Error('network error') }));
    expect(screen.getByText('There was an error loading this pathway.')).toBeInTheDocument();
    expect(screen.queryByText('Tab content')).not.toBeInTheDocument();
  });

  it('renders the header, the tabs and the tab content once the pathway is loaded', () => {
    renderComponent(buildQuery({ data: dataEngineering }));

    expect(HeaderSlot).toHaveBeenCalledWith(
      { courseOrg: 'MIT OpenCourseWare', courseTitle: 'Data Engineering Fundamentals' },
      expect.anything(),
    );
    const navigation = screen.getByRole('navigation', { name: 'Pathway Material' });
    expect(navigation).toContainElement(screen.getByRole('link', { name: 'Outline' }));
    expect(screen.getByRole('link', { name: 'Progress' })).toHaveClass('active');
    expect(screen.getByText('Tab content')).toBeInTheDocument();
    expect(screen.getByText('FooterSlot')).toBeInTheDocument();
  });
});
