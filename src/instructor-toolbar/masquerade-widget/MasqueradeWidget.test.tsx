import { getConfig } from '@edx/frontend-platform';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { MasqueradeWidget } from './MasqueradeWidget';
import {
  fireEvent,
  getAllByRole,
  initializeTestStore,
  render,
  screen,
  waitFor,
  within,
} from '../../setupTest';

describe('Masquerade Widget Dropdown', () => {
  let mockData;
  let courseware;
  let mockResponse;
  let axiosMock: MockAdapter;
  let masqueradeUrl: string;
  const masqueradeOptions = [
    {
      name: 'Staff',
      role: 'staff',
    },
    {
      name: 'Specific Student...',
      role: 'student',
      user_name: '',
    },
    {
      group_id: 1,
      name: 'Audit',
      role: 'student',
      user_partition_id: 50,
    },
  ];

  beforeAll(async () => {
    const store = await initializeTestStore();
    courseware = store.getState().courseware;
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    masqueradeUrl = `${getConfig().LMS_BASE_URL}/courses/${courseware.courseId}/masquerade`;
    mockData = {
      courseId: courseware.courseId,
      onError: jest.fn(),
    };
  });

  beforeEach(() => {
    mockResponse = {
      success: true,
      active: {
        course_key: courseware.courseId,
        group_id: null,
        role: 'staff',
        user_name: null,
        user_partition_id: null,
        group_name: null,
      },
      available: masqueradeOptions,
    };
    axiosMock.reset();
    axiosMock.onGet(masqueradeUrl).reply(200, mockResponse);
  });

  it('renders masquerade name correctly', async () => {
    render(<MasqueradeWidget {...mockData} />);
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(screen.getByRole('button')).toHaveTextContent('Staff');
  });

  masqueradeOptions.forEach((option) => {
    it(`marks role ${option.role} as active`, async () => {
      const active = {
        course_key: courseware.courseId,
        group_id: option.group_id ?? null,
        role: option.role,
        user_name: option.user_name ?? null,
        user_partition_id: option.user_partition_id ?? null,
        group_name: null,
      };

      mockResponse = {
        success: true,
        active,
        available: masqueradeOptions,
      };

      axiosMock.reset();
      axiosMock.onGet(masqueradeUrl).reply(200, mockResponse);

      const { container } = render(<MasqueradeWidget {...mockData} />);
      const dropdownToggle = container.querySelector('.dropdown-toggle')!;
      fireEvent.click(dropdownToggle);
      const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
      await within(dropdownMenu).findAllByRole('button'); // Wait for the buttons to load/render
      getAllByRole(dropdownMenu, 'button', { hidden: true }).forEach(button => {
        if (button.textContent === option.name) {
          expect(button).toHaveClass('active');
        } else {
          expect(button).not.toHaveClass('active');
        }
      });
    });
  });

  it('handles the clicks with toggle', async () => {
    const { container } = render(<MasqueradeWidget {...mockData} />);
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    const dropdownToggle = container.querySelector('.dropdown-toggle')!;
    fireEvent.click(dropdownToggle);
    const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
    const studentOption = await within(dropdownMenu).findByRole('button', { name: 'Specific Student...' });
    fireEvent.click(studentOption);
    getAllByRole(dropdownMenu, 'button', { hidden: true }).forEach(button => {
      if (button.textContent === 'Specific Student...') {
        expect(button).toHaveClass('active');
      } else {
        expect(button).not.toHaveClass('active');
      }
    });
  });

  it('can masquerade as a specific user', async () => {
    const user = userEvent.setup();
    // Configure our mock:
    axiosMock.onPost(masqueradeUrl).reply(200, {
      ...mockResponse,
      active: { ...mockResponse.active, role: null, user_name: 'testUser' },
    });
    // Render the masquerade controls:
    const { container } = render(<MasqueradeWidget {...mockData} />);
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    // Select "specific student..."
    const dropdownToggle = container.querySelector('.dropdown-toggle')!;
    await user.click(dropdownToggle);
    const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
    const studentOption = await within(dropdownMenu).findByRole('button', { name: 'Specific Student...' });
    await user.click(studentOption);

    // Enter a username, POST the request to the server
    const usernameInput = await screen.findByLabelText(/Username or email/);
    await user.type(usernameInput, 'testuser');
    expect(axiosMock.history.post).toHaveLength(0);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
  });

  it('can display an error when failing to masquerade as a specific user', async () => {
    const user = userEvent.setup();
    // Configure our mock:
    axiosMock.onPost(masqueradeUrl).reply(200, { // Note: The API endpoint returns a 200 response on error!
      success: false,
      error: 'That user does not exist',
    });
    // Render the masquerade controls:
    const { container } = render(<MasqueradeWidget {...mockData} />);
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    // Select "specific student..."
    const dropdownToggle = container.querySelector('.dropdown-toggle')!;
    await user.click(dropdownToggle);
    const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
    const studentOption = await within(dropdownMenu).findByRole('button', { name: 'Specific Student...' });
    await user.click(studentOption);

    // Enter a username, POST the request to the server
    const usernameInput = await screen.findByLabelText(/Username or email/);
    await user.type(usernameInput, 'testuser');
    expect(axiosMock.history.post).toHaveLength(0);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await waitFor(() => {
      expect(mockData.onError).toHaveBeenLastCalledWith('That user does not exist');
    });
  });

  it('can display an error when failing to masquerade as a specific user due to network issues etc', async () => {
    const user = userEvent.setup();
    // Configure our mock:
    axiosMock.onPost(masqueradeUrl).networkError();
    // Render the masquerade controls:
    const { container } = render(<MasqueradeWidget {...mockData} />);
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    // Select "specific student..."
    const dropdownToggle = container.querySelector('.dropdown-toggle')!;
    await user.click(dropdownToggle);
    const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
    const studentOption = await within(dropdownMenu).findByRole('button', { name: 'Specific Student...' });
    await user.click(studentOption);

    // Enter a username, POST the request to the server
    const usernameInput = await screen.findByLabelText(/Username or email/);
    await user.type(usernameInput, 'testuser');
    expect(axiosMock.history.post).toHaveLength(0);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await waitFor(() => {
      expect(mockData.onError).toHaveBeenLastCalledWith('An error has occurred; please try again.');
    });
  });

  describe('after a masquerade change', () => {
    const courseId = 'course-v1:edX+Test+Run';
    const originalLocation = global.location;
    let reload: jest.Mock;
    let assign: jest.Mock;

    const setLocation = (pathname: string, search = '', hash = '') => {
      Object.defineProperty(global, 'location', {
        configurable: true,
        value: {
          pathname, search, hash, reload, assign,
        },
      });
    };

    const masqueradeAsUser = async (user: ReturnType<typeof userEvent.setup>) => {
      const { container } = render(<MasqueradeWidget {...mockData} />);
      await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
      await user.click(container.querySelector('.dropdown-toggle')!);
      const dropdownMenu = container.querySelector('.dropdown-menu') as HTMLElement;
      await user.click(await within(dropdownMenu).findByRole('button', { name: 'Specific Student...' }));
      await user.type(await screen.findByLabelText(/Username or email/), 'testuser');
      await user.keyboard('{Enter}');
      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    };

    beforeEach(() => {
      reload = jest.fn();
      assign = jest.fn();
      axiosMock.onPost(masqueradeUrl).reply(200, {
        ...mockResponse,
        active: { ...mockResponse.active, role: null, user_name: 'testUser' },
      });
    });

    afterEach(() => {
      Object.defineProperty(global, 'location', { configurable: true, value: originalLocation });
    });

    it('drops the target user id from a learner progress url', async () => {
      setLocation(`/learning/course/${courseId}/progress/123/`, '?foo=bar', '#top');
      await masqueradeAsUser(userEvent.setup());
      await waitFor(() => expect(assign).toHaveBeenCalledWith(`/learning/course/${courseId}/progress?foo=bar#top`));
      expect(reload).not.toHaveBeenCalled();
    });

    it('reloads on a non-progress page', async () => {
      setLocation(`/learning/course/${courseId}/home`);
      await masqueradeAsUser(userEvent.setup());
      await waitFor(() => expect(reload).toHaveBeenCalled());
      expect(assign).not.toHaveBeenCalled();
    });

    it('reloads on the plain progress page', async () => {
      setLocation(`/learning/course/${courseId}/progress`);
      await masqueradeAsUser(userEvent.setup());
      await waitFor(() => expect(reload).toHaveBeenCalled());
      expect(assign).not.toHaveBeenCalled();
    });

    it('neither reloads nor navigates when masquerading fails', async () => {
      axiosMock.reset();
      axiosMock.onGet(masqueradeUrl).reply(200, mockResponse);
      axiosMock.onPost(masqueradeUrl).reply(200, { success: false, error: 'That user does not exist' });
      setLocation(`/learning/course/${courseId}/progress/123/`);
      await masqueradeAsUser(userEvent.setup());
      await waitFor(() => {
        expect(mockData.onError).toHaveBeenLastCalledWith('That user does not exist');
      });
      expect(reload).not.toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
    });
  });
});
