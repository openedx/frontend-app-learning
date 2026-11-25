import { Factory } from 'rosie';
import { getSiteConfig, mergeAppConfig } from '@openedx/frontend-base';
import {
  act, fireEvent, screen, waitFor,
} from '@testing-library/react';

import { appId } from '@src/constants';
import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { testIDs } from '../../sequence/Unit/ContentIFrame';

describe('Calculator', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    act(() => mergeAppConfig(appId, { SUPPORT_URL_CALCULATOR_MATH: null }));
  });

  const renderUnit = async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      course_access: { has_access: false },
      show_calculator: true,
    });
    const fixtures = mockCourseRequests({ courseMetadata });
    const { courseId, sequenceId, unitId } = fixtures;
    renderRoutes(routes, unitPath(courseId, sequenceId, unitId));
    await screen.findByTestId(testIDs.contentIFrame);
    return fixtures;
  };

  it('expands on click', async () => {
    await renderUnit();

    expect(screen.queryByRole('button', { name: 'Calculate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Calculator Instructions' })).not.toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Calculator' });
    expect(button.querySelector('svg')).toHaveClass('fa-calculator');

    fireEvent.click(button);
    expect(button.querySelector('svg')).toHaveClass('fa-times-circle');
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculator Instructions' })).toBeInTheDocument();

    fireEvent.click(button);
    expect(button.querySelector('svg')).toHaveClass('fa-calculator');
  });

  it('displays instructions on click', async () => {
    await renderUnit();

    const button = screen.getByRole('button', { name: 'Calculator' });
    fireEvent.click(button);

    const instructionsButton = screen.getByRole('button', { name: 'Calculator Instructions' });
    expect(instructionsButton.querySelector('svg')).toHaveClass('fa-question-circle');
    expect(screen.queryByText(/For detailed information, see/)).not.toBeInTheDocument();

    fireEvent.click(instructionsButton);
    expect(instructionsButton.querySelector('svg')).toHaveClass('fa-times-circle');
    expect(screen.getByText(/For detailed information, see/)).toBeInTheDocument();

    fireEvent.click(instructionsButton);
    expect(instructionsButton.querySelector('svg')).toHaveClass('fa-question-circle');
  });

  it('links the instructions to SUPPORT_URL_CALCULATOR_MATH from the app config', async () => {
    mergeAppConfig(appId, { SUPPORT_URL_CALCULATOR_MATH: 'https://example.com/calculator-math' });
    await renderUnit();

    fireEvent.click(screen.getByRole('button', { name: 'Calculator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculator Instructions' }));

    expect(screen.getByRole('link', { name: 'Help Center' }))
      .toHaveAttribute('href', 'https://example.com/calculator-math');
  });

  it('handles submitting equation', async () => {
    const equation = 'log2(2^10)';
    const result = '10';

    const { axiosMock } = await renderUnit();
    axiosMock.onGet(new RegExp(`${getSiteConfig().lmsBaseUrl}/calculate*`)).reply(200, { result });

    fireEvent.click(screen.getByRole('button', { name: 'Calculator' }));
    const input = screen.getByRole('textbox', { name: 'Calculator Input' });
    const output = screen.getByRole('textbox', { name: 'Calculator Result' });
    const submitButton = screen.getByRole('button', { name: 'Calculate' });

    fireEvent.change(input, { target: { value: equation } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(output).toHaveValue(result));
    const calculateRequests = axiosMock.history.get.filter(({ url }) => url.includes('/calculate'));
    expect(calculateRequests).toHaveLength(1);
    expect(calculateRequests[0].url).toContain(new URLSearchParams({ equation }).toString());
  });
});
