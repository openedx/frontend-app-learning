import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Input } from '@edx/paragon';

import messages from './messages';

class MasqueradeUserNameInput extends Component {
  onError(...args) {
    return this.props.onError(...args);
  }

  onKeyPress(event) {
    if (event.key === 'Enter') {
      return this.onSubmit(event);
    }
    return true;
  }

  onSubmit(event) {
    const payload = {
      role: 'student',
      user_name: event.target.value,
    };
    this.props.onSubmit(payload).then((data) => {
      if (data && data.success) {
        global.location.reload();
      } else {
        const error = (data && data.error) || '';
        this.onError(error);
      }
    }).catch(() => {
      const message = this.props.intl.formatMessage(messages['userName.error.generic']);
      this.onError(message);
    });
    return true;
  }

  render() {
    return (
      <Input
        autoFocus
        className="flex-shrink-1"
        defaultValue=""
        label={this.props.intl.formatMessage(messages['userName.input.label'])}
        onKeyPress={(event) => this.onKeyPress(event)}
        placeholder={this.props.intl.formatMessage(messages['userName.input.placeholder'])}
        type="text"
      />
    );
  }
}
MasqueradeUserNameInput.propTypes = {
  intl: intlShape.isRequired,
  onError: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
export default injectIntl(MasqueradeUserNameInput);
