import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
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
    <Link
      className="text-dark-700"
      style={{ textDecoration: 'underline' }}
      to={`/course/${courseId}/home`}
    >
      {intl.formatMessage(messages.courseOutline)}
    </Link>
  );

  return (
    <section className="text-dark-700 mb-4">
      <h3 className="h4 mb-3">{intl.formatMessage(messages.detailedGrades)}</h3>
      {hasSectionScores && (
        <DetailedGradesTable sectionScores={sectionScores} />
      )}
      {!hasSectionScores && (
        <p className="small">You currently have no graded problem scores.</p>
      )}
      <p className="x-small">
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
