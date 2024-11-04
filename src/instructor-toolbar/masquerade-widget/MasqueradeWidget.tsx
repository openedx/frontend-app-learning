/* eslint-disable import/prefer-default-export */
import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown } from '@openedx/paragon';

import { MasqueradeUserNameInput } from './MasqueradeUserNameInput';
import { MasqueradeWidgetOption } from './MasqueradeWidgetOption';
import {
  ActiveMasqueradeData,
  getMasqueradeOptions,
  MasqueradeOption,
  Payload,
  postMasqueradeOptions,
} from './data/api';
import messages from './messages';

interface Props {
  courseId: string;
  onError: (error: string) => void;
}

export const MasqueradeWidget: React.FC<Props> = ({ courseId, onError }) => {
  const intl = useIntl();
  const [autoFocus, setAutoFocus] = React.useState(false);
  const [active, setActive] = React.useState<ActiveMasqueradeData>({
    courseKey: '',
    role: 'staff',
    groupId: null,
    groupName: null,
    userName: null,
    userPartitionId: null,
  });
  const [available, setAvailable] = React.useState<MasqueradeOption[]>([]);
  const [shouldShowUserNameInput, setShouldShowUserNameInput] = React.useState(false);

  React.useEffect(() => {
    if (active.courseKey === courseId) {
      return; // Already fetched.
    }
    getMasqueradeOptions(courseId).then((data) => {
      if (data.success) {
        const newActive = data.active || {};
        const newAvailable = data.available || [];
        if (newActive.userName) {
          setAutoFocus(false);
          setShouldShowUserNameInput(true);
        }
        setActive(newActive);
        setAvailable(newAvailable);
      } else {
        // This was explicitly denied by the backend;
        // assume it's disabled/unavailable.
        onError('Unable to get masquerade options');
      }
    }).catch((response) => {
      // There's not much we can do to recover;
      // if we can't fetch masquerade options,
      // assume it's disabled/unavailable.
      // eslint-disable-next-line no-console
      console.error('Unable to get masquerade options', response);
    });
  }, [courseId, onError]);

  const handleSubmit = React.useCallback(async (payload: Payload) => {
    onError(''); // Clear any error
    return postMasqueradeOptions(courseId, payload);
  }, [courseId]);

  const toggle = React.useCallback((
    show: boolean | undefined,
    groupId: number | null,
    groupName: string,
    role: 'staff' | 'student',
    userName: string,
    userPartitionId: number | null,
  ) => {
    setAutoFocus(true);
    // set masquerade: groupName
    setShouldShowUserNameInput((prev) => (show === undefined ? !prev : show));
    setActive(prev => ({
      ...prev,
      groupId,
      groupName,
      role,
      userName,
      userPartitionId,
    }));
  }, []);

  const specificLearnerInputText = intl.formatMessage(messages.placeholder);
  return (
    <div className="flex-grow-1">
      <div className="row">
        <span className="col-auto col-form-label pl-3"><FormattedMessage {...messages.titleViewAs} /></span>
        <Dropdown className="flex-shrink-1 mx-1">
          <Dropdown.Toggle id="masquerade-widget-toggle" variant="inverse-outline-primary">
            {active.groupName ?? active.userName ?? intl.formatMessage(messages.titleStaff)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {available.map(group => (
              <MasqueradeWidgetOption
                groupId={group.groupId}
                groupName={group.name}
                key={group.name}
                role={group.role}
                selected={active}
                userName={group.userName}
                userPartitionId={group.userPartitionId}
                userNameInputToggle={toggle}
                onSubmit={handleSubmit}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {shouldShowUserNameInput && (
        <div className="row mt-2">
          <span className="col-auto col-form-label pl-3" id="masquerade-search-label">{`${specificLearnerInputText}:`}</span>
          <MasqueradeUserNameInput
            id="masquerade-search"
            className="col-4"
            autoFocus={autoFocus}
            defaultValue={active.userName ?? ''}
            onError={onError}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
};
