import { screen, render } from '@testing-library/react';
import Chat from './Chat';

// Mock getAuthenticatedUser to provide a stable userId
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => ({ userId: 'user-123' }),
}));

// Capture props passed into PluginSlot for assertions
const mockPluginSlotSpy = jest.fn(() => null);
jest.mock('@openedx/frontend-plugin-framework', () => ({
  // Provide a minimal mock PluginSlot component that records props
  PluginSlot: (props) => {
    mockPluginSlotSpy(props);
    return <div data-testid="plugin-slot-mock" />;
  },
}));

describe('Chat component', () => {
  const baseProps = {
    enabled: true,
    enrollmentMode: 'audit',
    isStaff: false,
    courseId: 'course-v1:edX+DemoX+2024',
    unitId: 'block-v1:edX+DemoX+2024+type@sequential+block@seq123',
  };

  beforeEach(() => {
    mockPluginSlotSpy.mockClear();
  });

  it('renders nothing when disabled', () => {
    const { container } = render(<Chat {...baseProps} enabled={false} />);
    // When disabled we expect null render; container firstChild should be null
    expect(container.firstChild).toBeNull();
    expect(mockPluginSlotSpy).not.toHaveBeenCalled();
  });

  it('renders PluginSlot via portal when enabled', () => {
    render(<Chat {...baseProps} />);
    // Our mock PluginSlot renders a marker div in document.body via portal
    expect(screen.getByTestId('plugin-slot-mock')).toBeInTheDocument();
    expect(mockPluginSlotSpy).toHaveBeenCalledTimes(1);
  });

  it('passes correct pluginProps to PluginSlot', () => {
    render(<Chat {...baseProps} />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.id).toBe('learner_tools_slot');
    expect(call.pluginProps).toEqual({
      courseId: baseProps.courseId,
      unitId: baseProps.unitId,
      userId: 'user-123',
      isStaff: baseProps.isStaff,
      enrollmentMode: baseProps.enrollmentMode,
    });
  });

  it('allows null enrollmentMode (omitted prop) and still passes context', () => {
    render(<Chat {...baseProps} enrollmentMode={null} />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.pluginProps.enrollmentMode).toBeNull();
  });

  it('propagates isStaff=true correctly', () => {
    render(<Chat {...baseProps} isStaff />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.pluginProps.isStaff).toBe(true);
  });
});
