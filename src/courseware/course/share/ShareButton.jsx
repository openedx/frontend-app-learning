import { PropTypes } from 'prop-types';
import { Icon } from '@edx/paragon';
import { Share } from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { TwitterShareButton } from 'react-share';

import { stringifyUrl } from 'query-string';

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
      resetButtonStyle={false}
      className="px-1 ml-n1 btn-sm text-primary-500 btn btn-link"
    >
      <Icon src={Share} />
      {formatMessage(messages.shareButton)}
    </TwitterShareButton>
  );
}

ShareButton.propTypes = {
  url: PropTypes.string.isRequired,
};

export default ShareButton;
