import React from 'react';
import { render } from '@testing-library/react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import * as auth from '@edx/frontend-platform/auth';

import { LearnerToolsSlot } from './index';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: jest.fn(() => <div data-testid="plugin-slot">Plugin Slot</div>),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

describe('LearnerToolsSlot', () => {
  const defaultProps = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1',
    isStaff: false,
    enrollmentMode: 'verified',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body for createPortal
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders PluginSlot with correct props when user is authenticated', () => {
    const mockUser = { userId: 123, username: 'testuser' };
    auth.getAuthenticatedUser.mockReturnValue(mockUser);

    render(<LearnerToolsSlot {...defaultProps} />);

    expect(PluginSlot).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'org.openedx.frontend.learning.learner_tools.v1',
        idAliases: ['learner_tools_slot'],
        pluginProps: {
          courseId: defaultProps.courseId,
          unitId: defaultProps.unitId,
          userId: mockUser.userId,
          isStaff: defaultProps.isStaff,
          enrollmentMode: defaultProps.enrollmentMode,
        },
      }),
      {},
    );
  });

  it('returns null when user is not authenticated', () => {
    auth.getAuthenticatedUser.mockReturnValue(null);

    const { container } = render(<LearnerToolsSlot {...defaultProps} />);

    expect(container.firstChild).toBeNull();
    expect(PluginSlot).not.toHaveBeenCalled();
  });

  it('uses default null for enrollmentMode when not provided', () => {
    const mockUser = { userId: 456, username: 'testuser2' };
    auth.getAuthenticatedUser.mockReturnValue(mockUser);

    const { enrollmentMode, ...propsWithoutEnrollmentMode } = defaultProps;

    render(<LearnerToolsSlot {...propsWithoutEnrollmentMode} />);

    expect(PluginSlot).toHaveBeenCalledWith(
      expect.objectContaining({
        pluginProps: expect.objectContaining({
          enrollmentMode: null,
        }),
      }),
      {},
    );
  });

  it('passes isStaff=true correctly', () => {
    const mockUser = { userId: 789, username: 'staffuser' };
    auth.getAuthenticatedUser.mockReturnValue(mockUser);

    render(<LearnerToolsSlot {...defaultProps} isStaff />);

    expect(PluginSlot).toHaveBeenCalledWith(
      expect.objectContaining({
        pluginProps: expect.objectContaining({
          isStaff: true,
        }),
      }),
      {},
    );
  });

  it('renders to document.body via portal', () => {
    const mockUser = { userId: 999, username: 'portaluser' };
    auth.getAuthenticatedUser.mockReturnValue(mockUser);

    render(<LearnerToolsSlot {...defaultProps} />);

    // The portal should render to document.body
    expect(document.body.querySelector('[data-testid="plugin-slot"]')).toBeInTheDocument();
  });
});
