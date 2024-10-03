import React from 'react';
import { getAllByRole } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MasqueradeWidget from './MasqueradeWidget';
import {
  render, screen, fireEvent, initializeTestStore, waitFor, logUnhandledRequests,
} from '../../setupTest';

const originalConfig = jest.requireActual('@edx/frontend-platform').getConfig();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));
getConfig.mockImplementation(() => originalConfig);

describe('Masquerade Widget Dropdown', () => {
  let mockData;
  let courseware;
  let mockResponse;
  let axiosMock;
  let masqueradeUrl;
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
      onError: () => {},
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
    logUnhandledRequests(axiosMock);
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
      const dropdownToggle = container.querySelector('.dropdown-toggle');
      await act(async () => {
        await fireEvent.click(dropdownToggle);
      });
      const dropdownMenu = container.querySelector('.dropdown-menu');
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

    const dropdownToggle = container.querySelector('.dropdown-toggle');
    await act(async () => {
      await fireEvent.click(dropdownToggle);
    });
    const dropdownMenu = container.querySelector('.dropdown-menu');
    const studentOption = getAllByRole(dropdownMenu, 'button', { hidden: true }).filter(
      button => (button.textContent === 'Specific Student...'),
    )[0];
    await act(async () => {
      await fireEvent.click(studentOption);
    });
    getAllByRole(dropdownMenu, 'button', { hidden: true }).forEach(button => {
      if (button.textContent === 'Specific Student...') {
        expect(button).toHaveClass('active');
      } else {
        expect(button).not.toHaveClass('active');
      }
    });
  });
});
