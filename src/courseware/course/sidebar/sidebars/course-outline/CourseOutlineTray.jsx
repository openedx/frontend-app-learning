import { useContext, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useModel } from '../../../../../generic/model-store';
import { LOADING } from '../../../../../course-home/data/slice';
import Section from '../../../../../course-home/outline-tab/Section';
import PageLoading from '../../../../../generic/PageLoading';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import CourseOutlineTrigger, { ID } from './CourseOutlineTrigger';
import messages from './messages';

const CourseOutlineTray = ({ intl }) => {
  const [expandAll, setExpandAll] = useState(false);

  const {
    courseStatus,
  } = useSelector(state => state.courseHome);

  const activeSequenceId = useSelector(state => state.courseware.sequenceId);

  const {
    courseId,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const {
    courseBlocks,
  } = useModel('outline', courseId);

  const {
    verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  const {
    sectionId: activeSectionId,
  } = useModel('sequences', activeSequenceId);

  const rootCourseId = courseBlocks?.courses && Object.keys(courseBlocks?.courses)[0];

  if (courseStatus === LOADING) {
    return (
      <SidebarBase
        title={intl.formatMessage(messages.courseOutlineTitle)}
        ariaLabel={intl.formatMessage(messages.courseOutlineTray)}
        sidebarId={ID}
        className={classNames({
          'h-100': !verifiedMode && !shouldDisplayFullScreen,
          'mr-4': !shouldDisplayFullScreen,
        })}
      >
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
      </SidebarBase>
    );
  }

  return (
    <SidebarBase
      title={intl.formatMessage(messages.courseOutlineTitle)}
      ariaLabel={intl.formatMessage(messages.courseOutlineTray)}
      sidebarId={ID}
      className={classNames({
        'h-100': !verifiedMode && !shouldDisplayFullScreen,
        'mr-4': !shouldDisplayFullScreen,
      })}
    >
      {rootCourseId && (
        <>
          <div className="row mb-3 justify-content-center">
            <div className="col-12">
              <Button variant="outline-primary" block onClick={() => { setExpandAll(!expandAll); }}>
                {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
              </Button>
            </div>
          </div>
          <ol id="courseHome-outline" className="list-unstyled">
            {courseBlocks.courses[rootCourseId].sectionIds.map((sectionId) => (
              <Section
                key={sectionId}
                courseId={courseId}
                defaultOpen={sectionId === activeSectionId}
                expand={expandAll}
                section={courseBlocks.sections[sectionId]}
              />
            ))}
          </ol>
        </>
      )}
    </SidebarBase>
  );
};

CourseOutlineTray.propTypes = {
  intl: intlShape.isRequired,
};

CourseOutlineTray.Trigger = CourseOutlineTrigger;
CourseOutlineTray.ID = ID;

export default injectIntl(CourseOutlineTray);
