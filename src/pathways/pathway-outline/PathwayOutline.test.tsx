import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DECODE_ROUTES } from '@src/constants';
import { getPathway, getPathwayItems, markPathwayAchievementsSeen } from '@src/pathways/data/api';
import { dataEngineering } from '@src/pathways/data/__fixtures__/pathways';
import { dataEngineeringItems } from '@src/pathways/data/__fixtures__/pathwayItems';
import type { PathwayData } from '@src/pathways/data/types';
import {
  fireEvent, initializeMockApp, render, screen, waitFor,
} from '@src/setupTest';

import { PathwayOutline } from './PathwayOutline';

// The header is not what is tested here, and it needs the whole platform setup to render.
jest.mock('@src/plugin-slots/HeaderSlot', () => () => null);

jest.mock('@src/pathways/data/api', () => ({
  getPathway: jest.fn(),
  getPathwayItems: jest.fn(),
  markPathwayAchievementsSeen: jest.fn(),
}));

const mockGetPathway = getPathway as jest.MockedFunction<typeof getPathway>;
const mockGetPathwayItems = getPathwayItems as jest.MockedFunction<typeof getPathwayItems>;
const mockMarkPathwayAchievementsSeen = (
  markPathwayAchievementsSeen as jest.MockedFunction<typeof markPathwayAchievementsSeen>
);

const pathwayId = dataEngineering.pathway.id;
const resumeUrl = 'http://localhost:18000/courses/course-v1:edX+DE101+2026/jump_to/block-v1:edX+DE101+2026+type@vertical+block@unit';

const withProgress = (progress: Partial<NonNullable<PathwayData['progress']>>): PathwayData => ({
  ...dataEngineering,
  progress: { completedItemCount: 3, ...progress },
});

const renderComponent = () => render(
  <MemoryRouter initialEntries={[`/pathway/${pathwayId}/outline`]}>
    <Routes>
      <Route path={DECODE_ROUTES.PATHWAY_OUTLINE} element={<PathwayOutline />} />
      <Route path={DECODE_ROUTES.PATHWAY_ACHIEVEMENTS} element={<div>Achievements page</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('PathwayOutline', () => {
  beforeAll(() => {
    initializeMockApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPathway.mockResolvedValue(dataEngineering);
    mockGetPathwayItems.mockResolvedValue(dataEngineeringItems);
    mockMarkPathwayAchievementsSeen.mockResolvedValue(undefined);
  });

  it('shows no alerts when there is nothing to resume and no new achievements', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: dataEngineering.pathway.content.displayName })).toBeInTheDocument();
    expect(screen.queryByText('Pick up where you left off')).not.toBeInTheDocument();
    expect(screen.queryByText('Congratulations! You have achievements available.')).not.toBeInTheDocument();
  });

  it('links to where the learner left off when there is something to resume', async () => {
    mockGetPathway.mockResolvedValue(withProgress({ resumeUrl }));
    renderComponent();

    expect(await screen.findByText('Pick up where you left off')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resume Bootcamp' })).toHaveAttribute('href', resumeUrl);
  });

  it('marks the new achievements as seen and goes to them from the alert', async () => {
    mockGetPathway.mockResolvedValue(withProgress({ hasNewAchievements: true }));
    renderComponent();

    expect(await screen.findByText('Congratulations! You have achievements available.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'View achievements' }));

    expect(await screen.findByText('Achievements page')).toBeInTheDocument();
    await waitFor(() => expect(mockMarkPathwayAchievementsSeen).toHaveBeenCalledWith(pathwayId));
  });
});
