import {
  CourseOverviewSectionCompletionIconSlot,
} from '@src/plugin-slots/CourseOutlineSidebarSectionCompletionIconSlot';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { ChevronRight as ChevronRightIcon } from '@openedx/paragon/icons';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { useCourseOutlineData } from '../hooks';

const SidebarSection = ({ section, handleSelectSection }) => {
  const intl = useIntl();
  const {
    id,
    complete,
    title,
    sequenceIds,
    completionStat,
  } = section;

  const { activeSequenceId, isEnabledCompletionTracking } = useCourseOutlineData();
  const isActiveSection = sequenceIds.includes(activeSequenceId);

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        <CourseOverviewSectionCompletionIconSlot
          completionStat={completionStat}
          enabled={isEnabledCompletionTracking}
          active={isActiveSection}
        />
      </div>
      <div className="col-10 ml-3 p-0 flex-grow-1 text-dark-500 text-left text-break">
        {title}
        {isEnabledCompletionTracking && (
          <span className="sr-only">
            , {intl.formatMessage(complete
            ? courseOutlineMessages.completedSection
            : courseOutlineMessages.incompleteSection)}
          </span>
        )}

      </div>
    </>
  );

  return (
    <li className={classNames('course-sidebar-section', { 'active-section': isActiveSection })}>
      <Button
        variant="tertiary"
        className="d-flex align-items-center w-100 rounded-0 justify-content-start"
        onClick={() => handleSelectSection(id)}
      >
        {sectionTitle}
        <Icon src={ChevronRightIcon} />
      </Button>
    </li>
  );
};

SidebarSection.propTypes = {
  section: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    sequenceIds: PropTypes.arrayOf(PropTypes.string),
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  handleSelectSection: PropTypes.func.isRequired,
};

export default SidebarSection;
