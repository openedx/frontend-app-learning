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
      const message = this.props.intl.formatMessage(messages.genericError);
      this.onError(message);
    });
    return true;
  }

  render() {
    const {
      intl,
      onError,
      onSubmit,
      ...rest
    } = this.props;
    return (
      <Input
        aria-labelledby="masquerade-search-label"
        label={intl.formatMessage(messages.userNameLabel)}
        onKeyPress={(event) => this.onKeyPress(event)}
        type="text"
        {...rest}
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
