import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';
import { PathwayOutline } from './PathwayOutline';
import { PathwayProgress } from './PathwayProgress';

jest.mock('./data/apiHooks', () => ({
  usePathway: jest.fn(),
}));

jest.mock('./tab-page/TabPage', () => ({
  TabPage: jest.fn(({ children }) => <div>{children}</div>),
}));

const metadataQuery = { data: undefined };

// The pathway pages render their content inside the pathway TabPage
describe.each([
  { Page: PathwayOutline, activeTabSlug: 'outline', content: 'Outline' },
  { Page: PathwayProgress, activeTabSlug: 'progress', content: 'Progress' },
])('$Page.name', ({ Page, activeTabSlug, content }) => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathway as jest.Mock).mockReturnValue(metadataQuery);
  });

  it('renders its tab of the pathway in the URL', () => {
    render(
      <MemoryRouter initialEntries={['/pathway/pathway-1']}>
        <Routes>
          <Route path="/pathway/:pathwayId" element={<Page />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(usePathway).toHaveBeenCalledWith('pathway-1');
    expect(TabPage).toHaveBeenCalledWith(
      expect.objectContaining({ activeTabSlug, pathwayId: 'pathway-1', pathwayStatus: { metadataQuery } }),
      expect.anything(),
    );
    expect(screen.getByText(content)).toBeInTheDocument();
  });
});
