import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

interface SidebarUnitContentProps {
  title?: string;
  isComplete?: boolean;
  isCompletionTrackingEnabled: boolean;
  icon: React.ReactNode;
}

const SidebarUnitContent = ({
  title,
  isComplete,
  isCompletionTrackingEnabled,
  icon,
}: SidebarUnitContentProps) => {
  const intl = useIntl();
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
            , {intl.formatMessage(isComplete ? messages.completedUnit : messages.incompleteUnit)}
          </span>
        )}
      </div>
    </>
  );
};

export default SidebarUnitContent;
