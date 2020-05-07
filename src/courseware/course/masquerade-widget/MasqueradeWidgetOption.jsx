import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';

import { postMasqueradeOptions } from '../../../data/api';

class MasqueradeWidgetOption extends Component {
  handleClick() {
    const {
      courseId,
      groupId,
      role,
      userName,
      userPartitionId,
    } = this.props;
    const payload = {};
    if (role) {
      payload.role = role;
    }
    if (groupId) {
      payload.group_id = parseInt(groupId, 10);
      payload.user_partition_id = parseInt(userPartitionId, 10);
    }
    if (userName) {
      payload.user_name = userName;
    }
    postMasqueradeOptions(courseId, payload).then(() => {
      global.location.reload();
    });
  }

  isSelected() {
    const selected = this.props.selected || {};
    const isEqual = (
      selected.userPartitionId === (this.props.userPartitionId || null)
      && selected.groupId === (this.props.groupId || null)
      && selected.role === this.props.role
    );
    return isEqual;
  }

  render() {
    const {
      groupName,
    } = this.props;
    if (!groupName) {
      return null;
    }
    const selected = this.isSelected();
    let className;
    if (selected) {
      className = 'active';
    }
    return (
      <Dropdown.Item
        className={className}
        href="#"
        onClick={(event) => this.handleClick(event)}
      >
        {groupName}
      </Dropdown.Item>
    );
  }
}
MasqueradeWidgetOption.propTypes = {
  courseId: PropTypes.string.isRequired,
  groupId: PropTypes.number,
  groupName: PropTypes.string.isRequired,
  role: PropTypes.string,
  selected: PropTypes.shape({
    courseKey: PropTypes.string.isRequired,
    groupId: PropTypes.number,
    role: PropTypes.string,
    userName: PropTypes.string,
    userPartitionId: PropTypes.number,
  }),
  userName: PropTypes.string,
  userPartitionId: PropTypes.number,
};
MasqueradeWidgetOption.defaultProps = {
  groupId: null,
  role: null,
  selected: null,
  userName: null,
  userPartitionId: null,
};

export default MasqueradeWidgetOption;
