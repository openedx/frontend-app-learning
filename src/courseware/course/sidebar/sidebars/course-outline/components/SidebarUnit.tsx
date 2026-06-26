import UnitIcon, {
  UNIT_ICON_TYPES,
  UnitIconType,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/UnitIcon';
import classNames from 'classnames';

import { CourseOutlineSidebarUnitSlot } from '@src/plugin-slots/CourseOutlineSidebarUnitSlot';
import UnitLinkWrapper from './UnitLinkWrapper';

interface SidebarUnitProps {
  id: string;
  courseId: string;
  sequenceId: string;
  isFirst: boolean;
  unit: {
    complete: boolean;
    icon: UnitIconType;
    id: string;
    title: string;
    type: string;
  };
  isActive: boolean;
  isLocked: boolean;
  activeUnitId: string;
  isCompletionTrackingEnabled: boolean;
}

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
}: SidebarUnitProps) => {
  const {
    complete,
    icon = UNIT_ICON_TYPES.other,
  } = unit;

  const iconType = isLocked ? UNIT_ICON_TYPES.lock : icon;
  const completeAndEnabled = complete && isCompletionTrackingEnabled;
  const unitIcon = <UnitIcon type={iconType} isCompleted={completeAndEnabled} />;
  return (
    <li className={classNames({
      'bg-info-100': isActive,
      'border-top border-light': !isFirst,
    })}
    >
      <UnitLinkWrapper
        {...{
          sequenceId,
          activeUnitId,
          id,
          courseId,
        }}
      >
        <CourseOutlineSidebarUnitSlot
          unit={unit}
          icon={unitIcon}
          isLocked={isLocked}
          isCompletionTrackingEnabled={isCompletionTrackingEnabled}
        />
      </UnitLinkWrapper>
    </li>
  );
};

export default SidebarUnit;
