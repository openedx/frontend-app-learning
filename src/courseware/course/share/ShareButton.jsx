import { PropTypes } from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { TwitterShareButton } from 'react-share';
import { stringifyUrl } from 'query-string';

import TwitterIcon from './assets/twitter.svg';

import messages from './messages';

function ShareButton({ url }) {
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
      <span class="pgn__stateful-btn-icon">
        <img src={TwitterIcon} alt="twitter icons" />
      </span>
      {formatMessage(messages.shareButton)}
    </TwitterShareButton>
  );
}

ShareButton.propTypes = {
  url: PropTypes.string.isRequired,
};

export default ShareButton;
