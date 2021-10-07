import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import {
  faCreativeCommons,
  faCreativeCommonsBy,
  faCreativeCommonsNc,
  faCreativeCommonsNd,
  faCreativeCommonsSa,
  faCreativeCommonsZero,
} from '@fortawesome/free-brands-svg-icons';

import messages from './messages';

const CreativeCommonsLicenseTags = {
  by: {
    intlMessagesId: 'learn.course.license.creativeCommons.terms.by',
    icon: faCreativeCommonsBy,
  },
  nc: {
    intlMessagesId: 'learn.course.license.creativeCommons.terms.nc',
    icon: faCreativeCommonsNc,
  },
  nd: {
    intlMessagesId: 'learn.course.license.creativeCommons.terms.nd',
    icon: faCreativeCommonsNd,
  },
  sa: {
    intlMessagesId: 'learn.course.license.creativeCommons.terms.sa',
    icon: faCreativeCommonsSa,
  },
  zero: {
    intlMessagesId: 'learn.course.license.creativeCommons.terms.zero',
    icon: faCreativeCommonsZero,
  },
};

function parseLicense(license) {
  if (!license) {
    // Default to All Rights Reserved if no license
    // is detected
    return ['all-rights-reserved', {}];
  }

  // Search for a colon character denoting the end
  // of the license type and start of the options
  const colonIndex = license.indexOf(':');
  if (colonIndex === -1) {
    // no options, so the entire thing is the license type
    return [license, {}];
  }

  // Split the license on the colon
  const licenseType = license.slice(0, colonIndex).trim();
  const optionStr = license.slice(colonIndex + 1).trim();

  let options = {};
  let version = '';

  // Set the defaultVersion to 4.0
  const defaultVersion = '4.0';
  optionStr.split(' ').forEach(option => {
    // Split the option into key and value
    // Default the value to `true` if no value
    let key = '';
    let value = '';
    if (option.indexOf('=') !== -1) {
      [key, value] = option.split('=');
    } else {
      key = option;
      value = true;
    }

    // Check for version
    if (key === 'ver') {
      version = value;
    } else {
      // Set the option key to lowercase to make
      // it easier to query
      options[key.toLowerCase()] = value;
    }
  });

  // No options
  if (Object.keys(options).length === 0) {
    // If no other options are set for the
    // license, set version to 1.0
    version = '1.0';

    // Set the `zero` option so the link
    // works correctly
    options = {
      zero: true,
    };
  }

  // Set the version to whatever was included,
  // using `defaultVersion` as a fallback if unset
  version = version || defaultVersion;

  return [licenseType, options, version];
}

function CourseLicense({
  license,
  intl,
}) {
  const renderAllRightsReservedLicense = () => (
    <div className="text-gray-500">
      <FontAwesomeIcon aria-hidden="true" className="mr-1" icon={faCopyright} />
      {intl.formatMessage(messages['learn.course.license.allRightsReserved.text'])}
    </div>
  );

  const renderCreativeCommonsLicense = (activeCreativeCommonsLicenseTags, version) => (
    <a
      className="text-decoration-none text-gray-500"
      rel="license noopener noreferrer"
      target="_blank"
      href={`https://creativecommons.org/licenses/${activeCreativeCommonsLicenseTags.join('-')}/${version}/`}
    >
      <span className="sr-only">
        {intl.formatMessage(messages['learn.course.license.creativeCommons.terms.preamble'])}&nbsp;
      </span>
      <FontAwesomeIcon aria-hidden="true" className="mr-1" icon={faCreativeCommons} />
      {activeCreativeCommonsLicenseTags.map(tag => (
        <span key={tag}>
          <span className="sr-only">
            {intl.formatMessage(messages[CreativeCommonsLicenseTags[tag].intlMessagesId])}&nbsp;
          </span>
          <FontAwesomeIcon aria-hidden="true" className="mr-1" icon={CreativeCommonsLicenseTags[tag].icon} />
        </span>
      ))}
      {intl.formatMessage(messages['learn.course.license.creativeCommons.text'])}
    </a>
  );

  const [licenseType, licenseOptions, licenseVersion] = parseLicense(license);

  return (
    <div className="text-right small py-1">
      {licenseType === 'all-rights-reserved' && renderAllRightsReservedLicense()}
      {licenseType === 'creative-commons' && renderCreativeCommonsLicense(
        Object.keys(licenseOptions),
        licenseVersion,
      )}
    </div>
  );
}

CourseLicense.propTypes = {
  license: PropTypes.string,
  intl: intlShape.isRequired,
};

CourseLicense.defaultProps = {
  license: 'all-rights-reserved',
};

export default injectIntl(CourseLicense);
