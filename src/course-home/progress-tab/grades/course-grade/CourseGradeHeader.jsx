import React from 'react';
import { useSelector } from 'react-redux';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Locked } from '@edx/paragon/icons';
import { Button, Icon } from '@edx/paragon';

import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

function CourseGradeHeader({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    org,
  } = useModel('courseHomeMeta', courseId);
  const {
    verifiedMode,
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const { administrator } = getAuthenticatedUser();
  const logUpgradeButtonClick = () => {
    sendTrackEvent('edx.ui.lms.course_progress.grades_upgrade.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
    });
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: '(none)',
      linkName: 'progress_locked',
      linkType: 'button',
      pageName: 'progress',
    });
  };
  let previewText;
  if (verifiedMode) {
    previewText = gradesFeatureIsFullyLocked
      ? intl.formatMessage(messages.courseGradePreviewUnlockCertificateBody)
      : intl.formatMessage(messages.courseGradePartialPreviewUnlockCertificateBody);
  } else {
    previewText = intl.formatMessage(messages.courseGradePreviewUpgradeDeadlinePassedBody);
  }
  return (
    <div className="row w-100 m-0 p-4 rounded-top bg-primary-500 text-white">
      <div className={`col-12 ${verifiedMode ? 'col-md-9' : ''} p-0`}>
        <div className="row w-100 m-0 p-0">
          <div className="col-1 p-0">
            <Icon src={Locked} />
          </div>
          <div className="col-11 px-2 p-sm-0 h4 text-white">
            <span aria-hidden="true">
              {intl.formatMessage(messages.courseGradePreviewHeaderAriaHidden)}
            </span>
            {gradesFeatureIsFullyLocked
              ? intl.formatMessage(messages.courseGradePreviewHeaderLocked)
              : intl.formatMessage(messages.courseGradePreviewHeaderLimited)}
          </div>
        </div>
        <div className="row w-100 m-0 p-0 justify-content-end">
          <div className="col-11 px-2 p-sm-0 small">
            {previewText}
          </div>
        </div>
      </div>
      {verifiedMode && (
        <div className="col-12 col-md-3 mt-3 mt-md-0 p-0 align-self-center text-right">
          <Button variant="brand" size="sm" href={verifiedMode.upgradeUrl} onClick={logUpgradeButtonClick}>
            {intl.formatMessage(messages.courseGradePreviewUpgradeButton)}
          </Button>
        </div>
      )}
    </div>
  );
}

CourseGradeHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseGradeHeader);
