import React from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

function CheckmarkBullet() {
  return (
    <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
  );
}

// Must be child of a <ul className="fa-ul">
export function VerifiedCertBullet() {
  const verifiedCertLink = (
    <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>
      <FormattedMessage
        id="learning.generic.upsell.verifiedCertBullet.verifiedCert"
        defaultMessage="verified certificate"
        description="Bolded words 'verified certificate', which is the name of credential the learner receives."
      />
    </a>
  );
  return (
    <li className="upsell-bullet">
      <CheckmarkBullet />
      <FormattedMessage
        id="learning.generic.upsell.verifiedCertBullet"
        defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resumé"
        description="Bullet showcasing benefit of earned credential."
        values={{ verifiedCertLink }}
      />
    </li>
  );
}

// Must be child of a <ul className="fa-ul">
export function UnlockGradedBullet() {
  const gradedAssignmentsInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upsell.unlockGradedBullet.gradedAssignments"
        defaultMessage="graded assignments"
        description="Bolded words 'graded assignments', which are the bolded portion of a bullet point highlighting that course content is unlocked when purchasing an upgrade. Graded assignments are any course content that is graded and are unlocked by upgrading to verified certificates."
      />
    </span>
  );
  return (
    <li className="upsell-bullet">
      <CheckmarkBullet />
      <FormattedMessage
        id="learning.generic.upsell.unlockGradedBullet"
        defaultMessage="Unlock your access to all course activities, including {gradedAssignmentsInBoldText}"
        description="Bullet showcasing benefit of additional course material."
        values={{ gradedAssignmentsInBoldText }}
      />
    </li>
  );
}

// Must be child of a <ul className="fa-ul">
export function FullAccessBullet() {
  const fullAccessInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upsell.fullAccessBullet.fullAccess"
        defaultMessage="Full access"
        description="Bolded phrase 'Full access', which is the bolded portion of a bullet point highlighting that access to course content will not have time limits."
      />
    </span>
  );
  return (
    <li className="upsell-bullet">
      <CheckmarkBullet />
      <FormattedMessage
        id="learning.generic.upsell.fullAccessBullet"
        defaultMessage="{fullAccessInBoldText} to course content and materials, even after the course ends"
        description="Bullet showcasing upgrade lifts access durations."
        values={{ fullAccessInBoldText }}
      />
    </li>
  );
}

// Must be child of a <ul className="fa-ul">
export function SupportMissionBullet() {
  const missionInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upsell.supportMissionBullet.mission"
        defaultMessage="mission"
        description="Bolded word 'mission', which is the bolded portion of a bullet point encouraging the learner to support the goals of the website."
      />
    </span>
  );
  return (
    <li className="upsell-bullet">
      <CheckmarkBullet />
      <FormattedMessage
        id="learning.generic.upsell.supportMissionBullet"
        defaultMessage="Support our {missionInBoldText} at {siteName}"
        description="Bullet encouraging user to support edX's goals."
        values={{ missionInBoldText, siteName: getConfig().SITE_NAME }}
      />
    </li>
  );
}
