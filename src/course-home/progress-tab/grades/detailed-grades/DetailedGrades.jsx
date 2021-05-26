import React from 'react';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import DetailedGradesTable from './DetailedGradesTable';

import messages from '../messages';

function DetailedGrades({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    sectionScores,
  } = useModel('progress', courseId);

  const hasSectionScores = sectionScores.length > 0;

  const outlineLink = (
    <Hyperlink className="muted-link inline-link" destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/course`}>
      {intl.formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  return (
    <section className="text-dark-700">
      <h3 className="h4 mb-3">{intl.formatMessage(messages.detailedGrades)}</h3>
      {hasSectionScores && (
        <DetailedGradesTable sectionScores={sectionScores} />
      )}
      {!hasSectionScores && (
        <p className="small">{intl.formatMessage(messages.detailedGradesEmpty)}</p>
      )}
      <p className="x-small m-0">
        <FormattedMessage
          id="progress.ungradedAlert"
          defaultMessage="For progress on ungraded aspects of the course, view your {outlineLink}."
          values={{ outlineLink }}
        />
      </p>
    </section>
  );
}

DetailedGrades.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DetailedGrades);
