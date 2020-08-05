import React from 'react';
import { useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useModel } from '../../generic/model-store';
import Chapter from './Chapter';
import CertificateBanner from './CertificateBanner';
import messages from './messages';

function ProgressTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const { administrator } = getAuthenticatedUser();

  const {
    coursewareSummary,
    studioUrl,
  } = useModel('progress', courseId);

  return (
    <section>
      {administrator && studioUrl && (
        <div className="row mb-3 mr-3 justify-content-end">
          <a className="btn-sm border border-info" href={studioUrl}>
            {intl.formatMessage(messages.studioLink)}
          </a>
        </div>
      )}
      <CertificateBanner />
      {coursewareSummary.map((chapter) => (
        <Chapter
          key={chapter.displayName}
          chapter={chapter}
        />
      ))}
    </section>
  );
}

ProgressTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ProgressTab);
