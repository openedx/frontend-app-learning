import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  initializeTestStore, render, screen,
} from '../../setupTest';
import ActiveEnterpriseAlert from './ActiveEnterpriseAlert';

describe('ActiveEnterpriseAlert', () => {
  const mockData = {
    payload: {
      text: 'test message',
      courseId: 'test-course-id',
    },
  };
  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  it('Shows alert message and links', () => {
    render(<ActiveEnterpriseAlert {...mockData} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('test message')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'change enterprise now' })).toHaveAttribute(
      'href', `${getConfig().LMS_BASE_URL}/enterprise/select/active/?success_url=http%3A%2F%2Flocalhost%2Fcourse%2Ftest-course-id%2Fhome`,
    );
  });
});
