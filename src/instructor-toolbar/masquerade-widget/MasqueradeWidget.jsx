import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';

import MasqueradeWidgetOption from './MasqueradeWidgetOption';
import { getMasqueradeOptions } from './data/api';

class MasqueradeWidget extends Component {
  constructor(props) {
    super(props);
    this.courseId = props.courseId;
    this.state = {
      options: [],
    };
  }

  componentDidMount() {
    getMasqueradeOptions(this.courseId).then((data) => {
      if (data.success) {
        const options = this.parseAvailableOptions(data);
        this.setState({
          options,
        });
      } else {
        console.warn('Unable to get masquerade options', data);
      }
    }).catch((response) => {
      console.error('Unable to get masquerade options', response);
    });
  }

  parseAvailableOptions(payload) {
    const data = payload || {};
    const active = data.active || {};
    const available = data.available || [];
    const options = available.map((group) => (
      <MasqueradeWidgetOption
        courseId={this.courseId}
        groupId={group.groupId}
        groupName={group.name}
        key={group.name}
        role={group.role}
        selected={active}
        userName={group.userName}
        userPartitionId={group.userPartitionId}
      />
    ));
    return options;
  }

  render() {
    const {
      options,
    } = this.state;
    return (
      <Dropdown>
        <Dropdown.Button>
          View this course as
        </Dropdown.Button>
        <Dropdown.Menu>
          {options}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
MasqueradeWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
};
export default MasqueradeWidget;
