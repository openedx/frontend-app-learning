import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

function DatesBanner(props) {
  const {
    intl,
    name,
    bannerClickHandler,
  } = props;

  return (
    <div className="banner rounded my-2 p-3 container-fluid border border-primary-200 bg-info-100">
      <div className="row justify-content-between">
        <div className={name === 'datesTabInfoBanner' ? 'col-12' : 'col-9'}>
          <strong>
            {intl.formatMessage(messages[`datesBanner.${name}.header`])}
          </strong>
          {intl.formatMessage(messages[`datesBanner.${name}.body`])}
        </div>
        {bannerClickHandler && (
          <button type="button" className="btn rounded align-self-center border border-primary bg-white mr-3 font-weight-bold" onClick={bannerClickHandler}>
            {intl.formatMessage(messages[`datesBanner.${name}.button`])}
          </button>
        )}
      </div>
    </div>
  );
}

DatesBanner.propTypes = {
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  bannerClickHandler: PropTypes.func,
};

DatesBanner.defaultProps = {
  bannerClickHandler: null,
};

export default injectIntl(DatesBanner);
