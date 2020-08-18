import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown } from '@edx/paragon';

import {
  ALERT_TYPES,
  UserMessagesContext,
} from '../../generic/user-messages';

import MasqueradeUserNameInput from './MasqueradeUserNameInput';
import MasqueradeWidgetOption from './MasqueradeWidgetOption';
import {
  getMasqueradeOptions,
  postMasqueradeOptions,
} from './data/api';
import messages from './messages';

class MasqueradeWidget extends Component {
  constructor(props) {
    super(props);
    this.courseId = props.courseId;
    this.state = {
      options: [],
      shouldShowUserNameInput: false,
    };
  }

  componentDidMount() {
    getMasqueradeOptions(this.courseId).then((data) => {
      if (data.success) {
        this.onSuccess(data);
      } else {
        // This was explicitly denied by the backend;
        // assume it's disabled/unavailable.
        // eslint-disable-next-line no-console
        this.onError('Unable to get masquerade options');
      }
    }).catch((response) => {
      // There's not much we can do to recover;
      // if we can't fetch masquerade options,
      // assume it's disabled/unavailable.
      // eslint-disable-next-line no-console
      console.error('Unable to get masquerade options', response);
    });
  }

  onError(message) {
    if (message) {
      this.errorAlertId = this.context.add({
        text: message,
        topic: 'course',
        type: ALERT_TYPES.ERROR,
        dismissible: false,
      });
    }
  }

  async onSubmit(payload) {
    this.context.remove(this.errorAlertId);
    const options = await postMasqueradeOptions(this.courseId, payload);
    return options;
  }

  onSuccess(data) {
    const options = this.parseAvailableOptions(data);
    this.setState({
      options,
    });
    const active = data.active || {};
    const message = this.getStatusMessage(active);
    if (message) {
      this.context.add({
        text: message,
        topic: 'course',
        type: ALERT_TYPES.INFO,
        dismissible: false,
      });
    }
  }

  getStatusMessage(active) {
    const {
      groupName,
    } = active;
    let message = '';
    if (active.userName) {
      message = this.props.intl.formatMessage(messages['status.userName'], {
        userName: active.userName,
      });
    } else if (groupName) {
      message = this.props.intl.formatMessage(messages['status.groupName'], {
        groupName,
      });
    } else if (active.role === 'student') {
      message = this.props.intl.formatMessage(messages['status.learner']);
    }
    return message;
  }

  toggle(show) {
    let shouldShow;
    if (show === undefined) {
      shouldShow = !this.state.shouldShowUserNameInput;
    } else {
      shouldShow = show;
    }
    this.setState({
      shouldShowUserNameInput: shouldShow,
    });
  }

  parseAvailableOptions(postData) {
    const data = postData || {};
    const active = data.active || {};
    const available = data.available || [];
    const options = available.map((group) => (
      <MasqueradeWidgetOption
        groupId={group.groupId}
        groupName={group.name}
        key={group.name}
        role={group.role}
        selected={active}
        userName={group.userName}
        userPartitionId={group.userPartitionId}
        userNameInput={this.userNameInput}
        userNameInputToggle={(...args) => this.toggle(...args)}
        onSubmit={(payload) => this.onSubmit(payload)}
      />
    ));
    return options;
  }

  render() {
    const {
      options,
    } = this.state;
    return (
      <>
        <Dropdown
          className="flex-shrink-1 mx-1 my-1"
          style={{ textAlign: 'center' }}
        >
          <Dropdown.Toggle variant="light">
            View this course as
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {options}
          </Dropdown.Menu>
        </Dropdown>
        {this.state.shouldShowUserNameInput && (
          <MasqueradeUserNameInput
            className="flex-shrink-0 mx-1 my-1"
            label="test"
            onError={(errorMessage) => this.onError(errorMessage)}
            onSubmit={(payload) => this.onSubmit(payload)}
            ref={(input) => { this.userNameInput = input; }}
          />
        )}
      </>
    );
  }
}
MasqueradeWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};
MasqueradeWidget.contextType = UserMessagesContext;
export default injectIntl(MasqueradeWidget);
