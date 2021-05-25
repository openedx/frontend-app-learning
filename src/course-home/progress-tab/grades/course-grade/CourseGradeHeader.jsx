import React from 'react';
import { useSelector } from 'react-redux';

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
    verifiedMode,
  } = useModel('progress', courseId);
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
            {intl.formatMessage(messages.courseGradePreviewHeader)}
          </div>
        </div>
        <div className="row w-100 m-0 p-0 justify-content-end">
          <div className="col-11 px-2 p-sm-0 small">
            {verifiedMode ? intl.formatMessage(messages.courseGradePreviewUnlockBody)
              : intl.formatMessage(messages.courseGradePreviewUpgradeDeadlinePassedBody)}
          </div>
        </div>
      </div>
      {verifiedMode && (
        <div className="col-12 col-md-3 mt-3 mt-md-0 p-0 align-self-center text-right">
          <Button variant="brand" size="sm" href={verifiedMode.upgradeUrl}>
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
