import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import CourseOutlineIcon from './CourseOutlineIcon';

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <CourseOutlineIcon {...props} />
  </IntlProvider>
);

describe('<CourseOutlineIcon />', () => {
  it('renders correctly when status is active', () => {
    const {
      getByTestId,
      queryByText,
      getByLabelText,
    } = render(<RootWrapper status="active" />);

    const outlineIcon = getByLabelText(messages.toggleCourseOutlineTrigger.defaultMessage);
    expect(outlineIcon).toBeInTheDocument();

    const courseOutlineDot = getByTestId('course-outline-dot');
    expect(courseOutlineDot).toBeInTheDocument();

    expect(queryByText(/active/i)).not.toBeInTheDocument();
  });

  it('renders correctly when status is not active', () => {
    const {
      getByLabelText,
      queryByTestId,
      queryByText,
    } = render(<RootWrapper status="inactive" />);

    const outlineIcon = getByLabelText(messages.toggleCourseOutlineTrigger.defaultMessage);
    expect(outlineIcon).toBeInTheDocument();

    const courseOutlineDot = queryByTestId('course-outline-dot');
    expect(courseOutlineDot).not.toBeInTheDocument();

    expect(queryByText(/inactive/i)).not.toBeInTheDocument();
  });
});
