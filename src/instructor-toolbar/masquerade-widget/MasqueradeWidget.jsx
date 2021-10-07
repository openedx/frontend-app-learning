import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown } from '@edx/paragon';

import { UserMessagesContext } from '../../generic/user-messages';

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
      autoFocus: false,
      masquerade: 'Staff',
      options: [],
      shouldShowUserNameInput: false,
      masqueradeUsername: null,
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
    this.props.onError(message);
  }

  async onSubmit(payload) {
    this.clearError();
    const options = await postMasqueradeOptions(this.courseId, payload);
    return options;
  }

  onSuccess(data) {
    const options = this.parseAvailableOptions(data);
    this.setState({
      options,
    });
  }

  clearError() {
    this.props.onError('');
  }

  toggle(show) {
    this.setState(prevState => ({
      autoFocus: true,
      masquerade: 'Specific Student...',
      shouldShowUserNameInput: show === undefined ? !prevState.shouldShowUserNameInput : show,
    }));
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
        userNameInputToggle={(...args) => this.toggle(...args)}
        onSubmit={(payload) => this.onSubmit(payload)}
      />
    ));
    if (active.userName) {
      this.setState({
        autoFocus: false,
        masquerade: 'Specific Student...',
        masqueradeUsername: active.userName,
        shouldShowUserNameInput: true,
      });
    } else if (active.groupName) {
      this.setState({ masquerade: active.groupName });
    } else if (active.role === 'student') {
      this.setState({ masquerade: 'Learner' });
    }
    return options;
  }

  render() {
    const {
      autoFocus,
      masquerade,
      options,
      shouldShowUserNameInput,
      masqueradeUsername,
    } = this.state;
    const specificLearnerInputText = this.props.intl.formatMessage(messages.placeholder);
    return (
      <div className="flex-grow-1">
        <div className="row">
          <span className="col-auto col-form-label pl-3">View this course as:</span>
          <Dropdown className="flex-shrink-1 mx-1">
            <Dropdown.Toggle variant="inverse-outline-primary">
              {masquerade}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {options}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {shouldShowUserNameInput && (
          <div className="row mt-2">
            <span className="col-auto col-form-label pl-3" id="masquerade-search-label">{`${specificLearnerInputText}:`}</span>
            <MasqueradeUserNameInput
              id="masquerade-search"
              className="col-4 form-control"
              autoFocus={autoFocus}
              defaultValue={masqueradeUsername}
              onError={(errorMessage) => this.onError(errorMessage)}
              onSubmit={(payload) => this.onSubmit(payload)}
            />
          </div>
        )}
      </div>
    );
  }
}
MasqueradeWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  onError: PropTypes.func.isRequired,
};
MasqueradeWidget.contextType = UserMessagesContext;
export default injectIntl(MasqueradeWidget);
