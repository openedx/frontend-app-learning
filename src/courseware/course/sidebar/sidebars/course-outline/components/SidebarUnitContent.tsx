import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

interface SidebarUnitContentProps {
  unit: {
    complete: boolean;
    icon: string;
    id: string;
    title: string;
    type: string;
  };
  isCompletionTrackingEnabled: boolean;
  icon: React.ReactNode;
}

const SidebarUnitContent = ({
  unit,
  isCompletionTrackingEnabled,
  icon,
}: SidebarUnitContentProps) => {
  const intl = useIntl();
  const {
    complete,
    title,
  } = unit;
  return (
    <>
      <div className="col-auto p-0">
        {icon}
      </div>
      <div className="col-10 p-0 ml-3 text-break">
        <span className="align-middle">
          {title}
        </span>
        {isCompletionTrackingEnabled && (
          <span className="sr-only">
            , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
          </span>
        )}
      </div>
    </>
  );
};

export default SidebarUnitContent;
