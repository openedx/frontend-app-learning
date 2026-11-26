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
import {
  getAuthenticatedUser, getSiteConfig, sendTrackEvent, useAppConfig, useIntl,
} from '@openedx/frontend-base';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata } from '@src/courseware/data/apiHooks';
import messages from './messages';

const SocialIcons = ({
  analyticsId = '',
  className = '',
  courseId,
  emailBody = messages.defaultEmailBody,
  emailSubject = null,
  hashtags = null,
  socialMessage = null,
}) => {
  const intl = useIntl();
  const {
    SOCIAL_UTM_MILESTONE_CAMPAIGN: socialUtmMilestoneCampaign,
    TWITTER_HASHTAG: twitterHashtag,
    TWITTER_URL: twitterUrl,
  } = useAppConfig();
  const marketingUrl = useCoursewareMetadata(courseId, { enabled: false }).data?.marketingUrl;

  const {
    org,
    title,
  } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};

  if (!marketingUrl) {
    return null;
  }

  const { siteName } = getSiteConfig();
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

  const socialUtmCampaign = socialUtmMilestoneCampaign
    ? `utm_campaign=${socialUtmMilestoneCampaign}&` : '';
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
          hashtags={hashtags ?? [twitterHashtag]}
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
        quote={socialMessage ? intl.formatMessage(socialMessage, { platform: siteName, title }) : ''}
        url={`${socialUtmMarketingUrl}&utm_source=facebook`}
      >
        <FacebookIcon round size={32} />
        <span className="sr-only">{intl.formatMessage(messages.shareService, { service: 'Facebook' })}</span>
      </FacebookShareButton>
      <EmailShareButton
        beforeOnClick={() => logClick('email')}
        body={emailBody ? `${intl.formatMessage(emailBody)}\n\n` : ''}
        className="ml-2"
        subject={emailSubject ? intl.formatMessage(emailSubject, { platform: siteName, title }) : ''}
        url={`${marketingUrl}?${socialUtmCampaign}utm_medium=email&utm_source=email`}
      >
        <EmailIcon round size={32} />
        <span className="sr-only">{intl.formatMessage(messages.shareEmail)}</span>
      </EmailShareButton>
    </div>
  );
};

SocialIcons.propTypes = {
  analyticsId: PropTypes.string,
  className: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  emailBody: PropTypes.shape({}),
  emailSubject: PropTypes.shape({}),
  // Defaults to the app config's TWITTER_HASHTAG.
  hashtags: PropTypes.arrayOf(PropTypes.string),
  socialMessage: PropTypes.shape({}),
};

export default SocialIcons;
