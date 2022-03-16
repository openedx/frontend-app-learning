import React from 'react';
import PropTypes from 'prop-types';
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';

import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { useModel } from '../../generic/model-store';

function SocialIcons({
  analyticsId,
  className,
  courseId,
  emailBody,
  emailSubject,
  hashtags,
  intl,
  socialMessage,
}) {
  const { marketingUrl } = useModel('coursewareMeta', courseId);

  const {
    org,
    title,
  } = useModel('courseHomeMeta', courseId);

  if (!marketingUrl) {
    return null;
  }

  const twitterUrl = getConfig().TWITTER_URL;
  const twitterAccount = twitterUrl && twitterUrl.substring(twitterUrl.lastIndexOf('/') + 1);

  const logClick = (service) => {
    if (!analyticsId) {
      return;
    }

    const { administrator } = getAuthenticatedUser();
    sendTrackEvent(analyticsId, {
      org_key: org,
      courserun_key: courseId,
      course_id: courseId, // should only be courserun_key, but left as-is for historical reasons
      is_staff: administrator,
      service,
    });
  };

  const socialUtmCampaign = getConfig().SOCIAL_UTM_MILESTONE_CAMPAIGN
    ? `utm_campaign=${getConfig().SOCIAL_UTM_MILESTONE_CAMPAIGN}&` : '';
  const socialUtmMarketingUrl = `${marketingUrl}?${socialUtmCampaign}utm_medium=social`;

  return (
    <div className={`social-icons ${className}`}>
      <LinkedinShareButton
        beforeOnClick={() => logClick('linkedin')}
        url={`${socialUtmMarketingUrl}&utm_source=linkedin`}
      >
        <LinkedinIcon round size={32} />
        <span className="sr-only">{intl.formatMessage(messages.shareService, { service: 'LinkedIn' })}</span>
      </LinkedinShareButton>
      {twitterAccount && (
        <TwitterShareButton
          beforeOnClick={() => logClick('twitter')}
          className="ml-2"
          hashtags={hashtags}
          title={socialMessage ? intl.formatMessage(socialMessage, { platform: `@${twitterAccount}`, title }) : ''}
          url={`${socialUtmMarketingUrl}&utm_source=twitter`}
        >
          <TwitterIcon round size={32} />
          <span className="sr-only">{intl.formatMessage(messages.shareService, { service: 'Twitter' })}</span>
        </TwitterShareButton>
      )}
      <FacebookShareButton
        beforeOnClick={() => logClick('facebook')}
        className="ml-2"
        quote={socialMessage ? intl.formatMessage(socialMessage, { platform: getConfig().SITE_NAME, title }) : ''}
        url={`${socialUtmMarketingUrl}&utm_source=facebook`}
      >
        <FacebookIcon round size={32} />
        <span className="sr-only">{intl.formatMessage(messages.shareService, { service: 'Facebook' })}</span>
      </FacebookShareButton>
      <EmailShareButton
        beforeOnClick={() => logClick('email')}
        body={emailBody ? `${intl.formatMessage(emailBody)}\n\n` : ''}
        className="ml-2"
        subject={emailSubject ? intl.formatMessage(emailSubject, { platform: getConfig().SITE_NAME, title }) : ''}
        url={`${marketingUrl}?${socialUtmCampaign}utm_medium=email&utm_source=email`}
      >
        <EmailIcon round size={32} />
        <span className="sr-only">{intl.formatMessage(messages.shareEmail)}</span>
      </EmailShareButton>
    </div>
  );
}

SocialIcons.defaultProps = {
  analyticsId: '',
  className: '',
  emailBody: messages.defaultEmailBody,
  emailSubject: null,
  hashtags: [getConfig().TWITTER_HASHTAG],
  socialMessage: null,
};

SocialIcons.propTypes = {
  analyticsId: PropTypes.string,
  className: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  emailBody: PropTypes.shape({}),
  emailSubject: PropTypes.shape({}),
  hashtags: PropTypes.arrayOf(PropTypes.string),
  intl: intlShape.isRequired,
  socialMessage: PropTypes.shape({}),
};

export default injectIntl(SocialIcons);
