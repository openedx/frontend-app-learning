import React from 'react';
import { getSiteConfig } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import ActiveEnterpriseAlert from './ActiveEnterpriseAlert';

describe('ActiveEnterpriseAlert', () => {
  const mockData = {
    payload: {
      text: 'test message',
      courseId: 'test-course-id',
    },
  };

  it('Shows alert message and links', () => {
    render(<ActiveEnterpriseAlert {...mockData} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('test message', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'change enterprise now' })).toHaveAttribute('href', `${getSiteConfig().lmsBaseUrl}/enterprise/select/active/?success_url=http%3A%2F%2Flocalhost%2Flearning%2Fcourse%2Ftest-course-id%2Fhome`);
  });
});
