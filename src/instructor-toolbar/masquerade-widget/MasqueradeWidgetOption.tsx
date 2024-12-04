import React from 'react';
import { Dropdown } from '@openedx/paragon';
import { ActiveMasqueradeData } from './data/api';

interface Payload {
  role?: string;
  user_name?: string;
  group_id?: number;
  user_partition_id?: number;
}

interface Props {
  groupId?: number;
  groupName: string;
  onSubmit: (payload: Payload) => Promise<Record<string, any>>;
  role?: string;
  selected?: ActiveMasqueradeData;
  userName?: string;
  userNameInputToggle?: (
    show: boolean,
    groupId: number | null,
    groupName: string,
    role: string | null,
    userName: string,
    userPartitionId: number | null,
  ) => void;
  userPartitionId?: number;
}

export const MasqueradeWidgetOption: React.FC<Props> = ({
  groupId = null,
  groupName,
  role = null,
  selected = null,
  userName = null,
  userPartitionId = null,
  ...props
}) => {
  const handleClick = React.useCallback(() => {
    if (userName || userName === '') {
      props.userNameInputToggle?.(true, groupId, groupName, role, userName, userPartitionId);
      return false;
    }
    const payload: Payload = {};
    if (role) {
      payload.role = role;
    }
    if (groupId) {
      payload.group_id = groupId;
      payload.user_partition_id = userPartitionId!;
    }
    props.onSubmit(payload).then(() => {
      global.location.reload();
    });
    return true;
  }, []);

  const isSelected = (
    groupId === selected?.groupId
    && role === selected?.role
    && userName === selected?.userName
    && userPartitionId === selected?.userPartitionId
  );

  if (!groupName) {
    return null;
  }

  const className = isSelected ? 'active' : '';
  return (
    <Dropdown.Item
      className={className}
      href="#"
      onClick={handleClick}
    >
      {groupName}
    </Dropdown.Item>
  );
};
