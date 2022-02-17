import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { SelectMenu } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { useModel, useModels } from '../../generic/model-store';
/** [MM-P2P] Experiment */
import { MMP2PFlyoverTrigger } from '../../experiments/mm-p2p';
import JumpNavMenuItem from './JumpNavMenuItem';

function CourseBreadcrumb({
  content, withSeparator, courseId, sequenceId, unitId, isStaff,
}) {
  const defaultContent = content.filter(destination => destination.default)[0] || { id: courseId, label: '', sequences: [] };
  return (
    <>
      {withSeparator && (
        <li className="col-auto p-0 mx-2 text-primary-500 text-truncate text-nowrap" role="presentation" aria-hidden>/</li>
      )}

      <li style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      >
        { getConfig().ENABLE_JUMPNAV !== 'true' || content.length < 2 || !isStaff
          ? (
            <Link
              className="text-primary-500"
              to={defaultContent.sequences.length
                ? `/course/${courseId}/${defaultContent.sequences[0].id}`
                : `/course/${courseId}/${defaultContent.id}`}
            >
              {defaultContent.label}
            </Link>
          )
          : (
            <SelectMenu isLink defaultMessage={defaultContent.label}>
              {content.map(item => (
                <JumpNavMenuItem
                  isDefault={item.default}
                  sequences={item.sequences}
                  courseId={courseId}
                  title={item.label}
                  currentSequence={sequenceId}
                  currentUnit={unitId}
                />
              ))}
            </SelectMenu>
          )}

      </li>
    </>
  );
}
CourseBreadcrumb.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      default: PropTypes.bool,
      id: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  withSeparator: PropTypes.bool,
  courseId: PropTypes.string,
  isStaff: PropTypes.bool,
};

CourseBreadcrumb.defaultProps = {
  withSeparator: false,
  sequenceId: null,
  unitId: null,
  courseId: null,
  isStaff: null,
};

export default function CourseBreadcrumbs({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const course = useModel('coursewareMeta', courseId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const allSequencesInSections = Object.fromEntries(useModels('sections', course.sectionIds).map(section => [section.id, {
    default: section.id === sectionId,
    title: section.title,
    sequences: useModels('sequences', section.sequenceIds),
  }]));

  const links = useMemo(() => {
    const chapters = [];
    const sequentials = [];
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
      Object.entries(allSequencesInSections).forEach(([id, section]) => {
        chapters.push({
          id,
          label: section.title,
          default: section.default,
          sequences: section.sequences,
        });
        if (section.default) {
          section.sequences.forEach(sequence => {
            sequentials.push({
              id: sequence.id,
              label: sequence.title,
              default: sequence.id === sequenceId,
              sequences: [sequence],
            });
          });
        }
      });
    }
    return [chapters, sequentials];
  }, [courseStatus, sequenceStatus, allSequencesInSections]);

  return (
    <nav aria-label="breadcrumb" className="my-4 d-inline-block col-sm-10">
      <ol className="list-unstyled d-flex  flex-nowrap align-items-center m-0">
        <li className="list-unstyled col-auto m-0 p-0">
          <Link
            className="flex-shrink-0 text-primary"
            to={`/course/${courseId}/home`}
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <FormattedMessage
              id="learn.breadcrumb.navigation.course.home"
              description="The course home link in breadcrumbs nav"
              defaultMessage="Course"
            />
          </Link>
        </li>
        {links.map(content => (
          <CourseBreadcrumb
            courseId={courseId}
            sequenceId={sequenceId}
            content={content}
            unitId={unitId}
            withSeparator
            isStaff={isStaff}
          />
        ))}
        {/** [MM-P2P] Experiment */}
        {mmp2p.state && mmp2p.state.isEnabled && (
          <MMP2PFlyoverTrigger options={mmp2p} />
        )}
      </ol>
    </nav>
  );
}

CourseBreadcrumbs.propTypes = {
  courseId: PropTypes.string.isRequired,
  sectionId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  isStaff: PropTypes.bool,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
  }),
};

CourseBreadcrumbs.defaultProps = {
  sectionId: null,
  sequenceId: null,
  unitId: null,
  isStaff: null,
  /** [MM-P2P] Experiment */
  mmp2p: {},
};
