import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DECODE_ROUTES } from '@src/constants';
import { getPathway, getPathwayAchievements } from '@src/pathways/data/api';
import { dataEngineering, dataEngineeringAchievements } from '@src/pathways/data/__fixtures__/pathways';
import { initializeMockApp, render, screen } from '@src/setupTest';

import { PathwayAchievements } from './PathwayAchievements';

// The header is not what is tested here, and it needs the whole platform setup to render.
jest.mock('@src/plugin-slots/HeaderSlot', () => () => null);

jest.mock('@src/pathways/data/api', () => ({
  getPathway: jest.fn(),
  getPathwayAchievements: jest.fn(),
}));

const mockGetPathway = getPathway as jest.MockedFunction<typeof getPathway>;
const mockGetPathwayAchievements = getPathwayAchievements as jest.MockedFunction<typeof getPathwayAchievements>;

const pathwayId = dataEngineering.pathway.id;

const renderComponent = () => render(
  <MemoryRouter initialEntries={[`/pathway/${pathwayId}/achievements`]}>
    <Routes>
      <Route path={DECODE_ROUTES.PATHWAY_ACHIEVEMENTS} element={<PathwayAchievements />} />
    </Routes>
  </MemoryRouter>,
);

describe('PathwayAchievements', () => {
  beforeAll(() => {
    initializeMockApp();
  });

  beforeEach(() => {
    mockGetPathway.mockResolvedValue(dataEngineering);
    mockGetPathwayAchievements.mockResolvedValue(dataEngineeringAchievements);
  });

  it('shows a card for each achievement of the pathway in the URL', async () => {
    renderComponent();

    expect(await screen.findAllByRole('button', { name: 'View certificate' }))
      .toHaveLength(dataEngineeringAchievements.length);
    dataEngineeringAchievements.forEach(({ displayName }) => {
      expect(screen.getByText(displayName)).toBeInTheDocument();
    });

    expect(mockGetPathway).toHaveBeenCalledWith(pathwayId);
    expect(mockGetPathwayAchievements).toHaveBeenCalledWith(pathwayId);
  });

  it('names the pathway category in the certificate of the pathway itself', async () => {
    renderComponent();

    expect(await screen.findByText('Bootcamp certificate')).toBeInTheDocument();
  });

  it('shows an error instead of the achievements when they cannot be loaded', async () => {
    mockGetPathwayAchievements.mockRejectedValue(new Error('network error'));
    renderComponent();

    expect(await screen.findByText('There was an error loading this pathway.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View certificate' })).not.toBeInTheDocument();
  });
});
