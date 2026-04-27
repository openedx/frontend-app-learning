import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import UnitIcon, { UNIT_ICON_TYPES } from './UnitIcon';
import UnitLinkWrapper from './UnitLinkWrapper';

const SidebarUnit = ({
  id,
  courseId,
  sequenceId,
  isFirst,
  unit,
  isActive,
  isLocked,
  activeUnitId,
  showOutlineEstimatedTime,
}) => {
  const intl = useIntl();
  const {
    complete,
    title,
    icon = UNIT_ICON_TYPES.other,
    effortTime,
    estimatedTimeMinutes,
  } = unit;

  const iconType = isLocked ? UNIT_ICON_TYPES.lock : icon;
  // Calculate unit effort time to display in the sidebar
  const minuteCount = typeof effortTime === 'number'
    ? Math.ceil(effortTime / 60)
    : (typeof estimatedTimeMinutes === 'number' ? Math.ceil(estimatedTimeMinutes) : 0);

  return (
    <li className={classNames({ 'bg-info-100': isActive, 'border-top border-light': !isFirst })}>
      <UnitLinkWrapper
        {...{
          sequenceId,
          activeUnitId,
          id,
          courseId,
        }}
      >
        <div className="col-auto p-0">
          <UnitIcon type={iconType} isCompleted={complete} />
        </div>
        <div className="col-10 p-0 ml-3 text-break">
          <span className="align-middle">
            {title}
            {/* Display the estimated time for the unit next to the title if showOutlineEstimatedTime is true and estimated time > 0 */}
            {showOutlineEstimatedTime && minuteCount > 0 && (
              <span className="small text-gray-500 font-weight-normal ml-2">
                {intl.formatMessage(messages.estimatedTimeMinutesAbbreviated, { minuteCount })}
              </span>
            )}
          </span>
          <span className="sr-only">
            , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
          </span>
        </div>
      </UnitLinkWrapper>
    </li>
  );
};

SidebarUnit.propTypes = {
  id: PropTypes.string.isRequired,
  isFirst: PropTypes.bool.isRequired,
  unit: PropTypes.shape({
    complete: PropTypes.bool,
    // Allow passing effort time directly on the unit for more accurate time
    // estimates, but fall back to using estimatedTimeMinutes if effortTime is not provided
    estimatedTimeMinutes: PropTypes.number,
    effortTime: PropTypes.number,
    icon: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  activeUnitId: PropTypes.string.isRequired,
  // Pass showOutlineEstimatedTime down to the SidebarUnit component
  showOutlineEstimatedTime: PropTypes.bool,
};

// Show the estimated time for units in the sidebar by default
SidebarUnit.defaultProps = {
  showOutlineEstimatedTime: true,
};

export default SidebarUnit;
