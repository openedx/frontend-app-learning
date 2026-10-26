import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DECODE_ROUTES } from '@src/constants';
import { getPathway, getPathwayProgress } from '@src/pathways/data/api';
import { dataEngineering, dataEngineeringProgress } from '@src/pathways/data/__fixtures__/pathways';
import { initializeMockApp, render, screen } from '@src/setupTest';

import { PathwayProgress } from './PathwayProgress';

// The header is not what is tested here, and it needs the whole platform setup to render.
jest.mock('@src/plugin-slots/HeaderSlot', () => () => null);

jest.mock('@src/pathways/data/api', () => ({
  getPathway: jest.fn(),
  getPathwayProgress: jest.fn(),
}));

const mockGetPathway = getPathway as jest.MockedFunction<typeof getPathway>;
const mockGetPathwayProgress = getPathwayProgress as jest.MockedFunction<typeof getPathwayProgress>;

const pathwayId = dataEngineering.pathway.id;

const renderComponent = () => render(
  <MemoryRouter initialEntries={[`/pathway/${pathwayId}/progress`]}>
    <Routes>
      <Route path={DECODE_ROUTES.PATHWAY_PROGRESS} element={<PathwayProgress />} />
    </Routes>
  </MemoryRouter>,
);

describe('PathwayProgress', () => {
  beforeAll(() => {
    initializeMockApp();
  });

  beforeEach(() => {
    mockGetPathway.mockResolvedValue(dataEngineering);
    mockGetPathwayProgress.mockResolvedValue(dataEngineeringProgress);
  });

  it('shows the completion, grades and achievements of the pathway in the URL', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'Bootcamp completion' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 of 6 items completed' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Data Pipelines/ })).toBeInTheDocument();
    expect(screen.getByText('No achievements earned')).toBeInTheDocument();

    expect(mockGetPathway).toHaveBeenCalledWith(pathwayId);
    expect(mockGetPathwayProgress).toHaveBeenCalledWith(pathwayId);
  });

  it('shows an error instead of the progress when it cannot be loaded', async () => {
    mockGetPathwayProgress.mockRejectedValue(new Error('network error'));
    renderComponent();

    expect(await screen.findByText('There was an error loading this pathway.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Bootcamp completion' })).not.toBeInTheDocument();
  });
});
