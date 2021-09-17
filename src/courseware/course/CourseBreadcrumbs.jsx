import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { Hyperlink, MenuItem, SelectMenu } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useModel, useModels } from '../../generic/model-store';
/** [MM-P2P] Experiment */
import { MMP2PFlyoverTrigger } from '../../experiments/mm-p2p';

function CourseBreadcrumb({
  content, withSeparator,
}) {
  const defaultContent = content.filter(destination => destination.default)[0];
  const { administrator } = getAuthenticatedUser();

  return (
    <>
      {withSeparator && (
        <li className="mx-2 text-primary-500" role="presentation" aria-hidden>/</li>
      )}
      <li>
        {process.env.NODE_ENV !== 'test' || content.length < 2 || !administrator
          ? (
            <a className="text-primary-500" href={defaultContent.url}>{defaultContent.label}
            </a>
          )
          : (
            <SelectMenu isLink defaultMessage={defaultContent.label}>
              {content.map(item => (
                <MenuItem
                  as={Hyperlink}
                  defaultSelected={item.default}
                  href={item.url}
                >
                  {item.label}
                </MenuItem>
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
      url: PropTypes.string,
      id: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  withSeparator: PropTypes.bool,
};

CourseBreadcrumb.defaultProps = {
  withSeparator: false,
};

export default function CourseBreadcrumbs({
  courseId,
  sectionId,
  sequenceId,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const course = useModel('coursewareMeta', courseId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sections = Object.fromEntries(useModels('sections', course.sectionIds).map(section => [section.id, section]));
  const possibleSequences = sections && sectionId ? sections[sectionId].sequenceIds : [];
  const sequences = Object.fromEntries(useModels('sequences', possibleSequences).map(sequence => [sequence.id, sequence]));
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const links = useMemo(() => {
    const temp = [];
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
      temp.push(course.sectionIds.map(id => ({
        id,
        label: sections[id].title,
        default: (id === sectionId),
        // navigate to first sequence in section, (TODO: navigate to first incomplete sequence in section)
        url: `${getConfig().BASE_URL}/course/${courseId}/${sections[id].sequenceIds[0]}`,
      })));
      temp.push(sections[sectionId].sequenceIds.map(id => ({
        id,
        label: sequences[id].title,
        default: id === sequenceId,
        // first unit it section (TODO: navigate to first incomplete  in sequence)
        url: `${getConfig().BASE_URL}/course/${courseId}/${sequences[id].id}/${sequences[id].unitIds[0]}`,
      })));
    }
    return temp;
  }, [courseStatus, sections, sequences]);

  return (
    <nav aria-label="breadcrumb" className="my-1 d-inline-block col-sm-10">
      <ol className="list-unstyled d-flex align-items-center m-0">
        <li>
          <a
            href={`${getConfig().LMS_BASE_URL}/courses/${course.id}/course/`}
            className="flex-shrink-0 text-primary"
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <FormattedMessage
              id="learn.breadcrumb.navigation.course.home"
              description="The course home link in breadcrumbs nav"
              defaultMessage="Course"
            />
          </a>
        </li>
        {links.map(content => (
          <CourseBreadcrumb
            content={content}
            withSeparator
          />
        ))}
        {/** [MM-P2P] Experiment */}
        {mmp2p.state.isEnabled && (
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

  /** [MM-P2P] Experiment */
  mmp2p: {},
};
