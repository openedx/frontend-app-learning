import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

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
        <div className={name === 'datesTabInfoBanner' ? 'col-12' : 'col-12 col-lg-9'}>
          <strong>
            {intl.formatMessage(messages[`datesBanner.${name}.header`])}
          </strong>
          {intl.formatMessage(messages[`datesBanner.${name}.body`])}
        </div>
        {bannerClickHandler && (
          <div className="col-auto col-lg-3 p-lg-0 d-inline-flex align-items-center justify-content-start justify-content-lg-center">
            <Button variant="outline-primary" className="align-self-center bg-white mt-3 mt-lg-0" onClick={bannerClickHandler}>
              {intl.formatMessage(messages[`datesBanner.${name}.button`])}
            </Button>
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
