import React from 'react';
import { PropTypes } from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { TwitterShareButton, TwitterIcon } from 'react-share';
import { stringifyUrl } from 'query-string';

import { Icon } from '@openedx/paragon';
import messages from './messages';

const ShareTwitterIcon = () => (
  <TwitterIcon
    round
    iconFillColor="#0A3055"
    bgStyle={{
      fill: '#fff',
    }}
  />
);

const ShareButton = ({ url }) => {
  const { formatMessage } = useIntl();

  const twitterUrl = stringifyUrl({
    url,
    query: {
      utm_source: 'twitter',
      utm_medium: 'social',
      utm_campaign: 'social-share-exp',
    },
  });

  return (
    <TwitterShareButton
      url={twitterUrl}
      title={formatMessage(messages.shareQuote)}
      resetButtonStyle={false}
      className="px-1 ml-n1 btn-sm text-primary-500 btn btn-link"
    >
      <Icon src={ShareTwitterIcon} />
      {formatMessage(messages.shareButton)}
    </TwitterShareButton>
  );
};

ShareButton.propTypes = {
  url: PropTypes.string.isRequired,
};

export default ShareButton;
