import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { CheckCircle, WarningFilled } from '@openedx/paragon/icons';
import { breakpoints, Icon, useWindowSize } from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';

import GradeRangeTooltip from './GradeRangeTooltip';
import messages from '../messages';
import { getLatestDueDateInFuture } from '../../utils';

const ResponsiveText = ({
  wideScreen, children, hasLetterGrades, passingGrade,
}) => {
  const className = wideScreen ? 'h4 m-0 align-bottom' : 'h5 align-bottom';
  const iconSize = wideScreen ? 'h3' : 'h4';

  return (
    <span className={className}>
      {children}
      {hasLetterGrades && (
        <span style={{ whiteSpace: 'nowrap' }}>
          &nbsp;
          <GradeRangeTooltip iconButtonClassName={iconSize} passingGrade={passingGrade} />
        </span>
      )}
    </span>
  );
};

const NoticeRow = ({
  wideScreen, icon, bgClass, message,
}) => {
  const textClass = wideScreen ? 'h4 m-0 align-bottom' : 'h5 align-bottom';
  return (
    <div className={`row w-100 m-0 px-4 py-3 py-md-4 rounded-bottom ${bgClass}`}>
      <div className="col-auto p-0">{icon}</div>
      <div className="col-11 pl-2 px-0">
        <span className={textClass}>{message}</span>
      </div>
    </div>
  );
};

const CourseGradeFooter = ({ passingGrade }) => {
  const intl = useIntl();
  const courseId = useContextId();

  const {
    courseGrade: { isPassing, letterGrade },
    gradingPolicy: { gradeRange },
    sectionScores,
  } = useModel('progress', courseId);

  const latestDueDate = getLatestDueDateInFuture(sectionScores);
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;
  const hasLetterGrades = Object.keys(gradeRange).length > 1;

  // build footer text
  let footerText = intl.formatMessage(messages.courseGradeFooterNonPassing, { passingGrade });
  if (isPassing) {
    if (hasLetterGrades) {
      const minGradeRangeCutoff = gradeRange[letterGrade] * 100;
      const possibleMaxGradeRangeValues = [...Object.values(gradeRange).filter(
        (grade) => (grade * 100 > minGradeRangeCutoff),
      )];
      const maxGradeRangeCutoff = possibleMaxGradeRangeValues.length ? Math.min(...possibleMaxGradeRangeValues) * 100
        : 100;

      footerText = intl.formatMessage(messages.courseGradeFooterPassingWithGrade, {
        letterGrade,
        minGrade: minGradeRangeCutoff.toFixed(0),
        maxGrade: maxGradeRangeCutoff.toFixed(0),
      });
    } else {
      footerText = intl.formatMessage(messages.courseGradeFooterGenericPassing);
    }
  }

  const passingIcon = isPassing ? (
    <Icon src={CheckCircle} className="text-success-300 d-inline-flex align-bottom" />
  ) : (
    <Icon src={WarningFilled} className="d-inline-flex align-bottom" />
  );

  return (
    <div>
      <NoticeRow
        wideScreen={wideScreen}
        icon={passingIcon}
        bgClass={isPassing ? 'bg-success-100' : 'bg-warning-100'}
        message={(
          <ResponsiveText
            wideScreen={wideScreen}
            hasLetterGrades={hasLetterGrades}
            passingGrade={passingGrade}
          >
            {footerText}
          </ResponsiveText>
        )}
      />
      {latestDueDate && (
        <NoticeRow
          wideScreen={wideScreen}
          icon={<Icon src={WarningFilled} className="d-inline-flex align-bottom" />}
          bgClass="bg-warning-100"
          message={intl.formatMessage(messages.courseGradeFooterDueDateNotice, {
            dueDate: intl.formatDate(latestDueDate, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'short',
            }),
          })}
        />
      )}
    </div>
  );
};

ResponsiveText.propTypes = {
  wideScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  hasLetterGrades: PropTypes.bool.isRequired,
  passingGrade: PropTypes.number.isRequired,
};

NoticeRow.propTypes = {
  wideScreen: PropTypes.bool.isRequired,
  icon: PropTypes.element.isRequired,
  bgClass: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

CourseGradeFooter.propTypes = {
  passingGrade: PropTypes.number.isRequired,
};

export default CourseGradeFooter;
