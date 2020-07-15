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
    <div className="banner rounded my-4 p-4 container-fluid border border-primary-200 bg-info-100">
      <div className="row w-100 m-0 justify-content-start justify-content-sm-between">
        <div className={name === 'datesTabInfoBanner' ? 'col-12' : 'col-12 col-md-9'}>
          <strong>
            {intl.formatMessage(messages[`datesBanner.${name}.header`])}
          </strong>
          {intl.formatMessage(messages[`datesBanner.${name}.body`])}
        </div>
        {bannerClickHandler && (
          <div className="col-auto col-md-3 p-md-0 d-inline-flex align-items-center justify-content-start justify-content-md-center">
            <button type="button" className="btn rounded align-self-center border border-primary bg-white mt-3 mt-md-0 font-weight-bold" onClick={bannerClickHandler}>
              {intl.formatMessage(messages[`datesBanner.${name}.button`])}
            </button>
          </div>
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
