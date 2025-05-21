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
  isCompletionTrackingEnabled,
}) => {
  const intl = useIntl();
  const {
    complete,
    title,
    icon = UNIT_ICON_TYPES.other,
  } = unit;

  const iconType = isLocked ? UNIT_ICON_TYPES.lock : icon;
  const completeAndEnabled = complete && isCompletionTrackingEnabled;

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
          <UnitIcon type={iconType} isCompleted={completeAndEnabled} />
        </div>
        <div className="col-10 p-0 ml-3 text-break">
          <span className="align-middle">
            {title}
          </span>
          {completeAndEnabled && (
            <span className="sr-only">
              , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
            </span>
          )}
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
  isCompletionTrackingEnabled: PropTypes.bool,
};

export default SidebarUnit;
