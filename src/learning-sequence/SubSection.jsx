import React, { Component, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import SubSectionNavigation from './SubSectionNavigation';
import { getSubSectionMetadata } from './api';
import CourseStructureContext from './CourseStructureContext';
import Unit from './Unit';

function useSubSectionMetadata(courseId, subSectionId) {
  const [metadata, setMetadata] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    getSubSectionMetadata(courseId, subSectionId).then((data) => {
      setMetadata(data);
      setLoaded(true);
    });
  }, [courseId, subSectionId]);

  return {
    metadata,
    loaded,
  };
}

function useExamRedirect(metadata, blocks) {
  useEffect(() => {
    if (metadata !== null && blocks !== null) {
      if (metadata.isTimeLimited) {
        global.location.href = blocks[metadata.itemId].lmsWebUrl;
      }
    }
  }, [metadata, blocks]);
}

/*


  const calculateUnitId = (metadata, options) => {
    const { first, last, preferredUnitId } = options;
    let position = metadata.position - 1; // metadata's position is 1's indexed
    position = first ? 0 : position;
    position = last ? metadata.unitIds.length - 1 : position;
    position = preferredUnitId ? metadata.unitIds.indexOf(preferredUnitId) : position;
    const unitId = metadata.items[position].id;

    return unitId;
  }

  handleUnitChange = (unitId) => {
    this.setState({
      unitId,
    });
  }

  */

export default function SubSection() {
  const {
    courseId,
    subSectionId,
    unitId,
    blocks,
  } = useContext(CourseStructureContext);
  const { metadata } = useSubSectionMetadata(courseId, subSectionId);

  useExamRedirect(metadata, blocks);

  if (blocks === null || metadata === null) {
    return null;
  }

  const unit = blocks[unitId];

  // units={this.state.units}
  // unitIds={this.state.subSectionMetadata.unitIds}
  // activeUnitId={this.state.unitId}
  // unitClickHandler={this.handleUnitChange}
  // nextClickHandler={this.handleNextClick}
  // previousClickHandler={this.handlePreviousClick}
  return (
    <section>

      <SubSectionNavigation />
      <Unit id={unitId} unit={unit} />
    </section>
  );
}


/*

 <h1>{course.displayName}</h1>
  <Breadcrumbs
    links={[
      { label: course.displayName, url: global.location.href },
      { label: chapter.displayName, url: global.location.href },
      { label: subSection.displayName, url: global.location.href },
    ]}
    activeLabel={currentUnit.pageTitle}
  />

  <SubSectionNavigation
    units={this.state.units}
    unitIds={this.state.subSectionMetadata.unitIds}
    activeUnitId={this.state.unitId}
    unitClickHandler={this.handleUnitChange}
    nextClickHandler={this.handleNextClick}
    previousClickHandler={this.handlePreviousClick}
  />

  <iframe
    title="yus"
    ref={this.iframeRef}
    src={iframeUrl}
  />
*/

// constructor(props, context) {
//   super(props, context);

//   // this.state = {
//   //   loading: true,
//   //   blocks: {},
//   //   units: {},
//   //   subSectionMetadata: null,
//   //   subSectionId: null,
//   //   subSectionIds: [],
//   //   unitId: null,
//   //   courseBlockId: null,
//   // };

//   // this.iframeRef = React.createRef();
// }

// componentDidMount() {
//   loadCourseSequence(this.props.match.params.courseId, this.props.match.params.subSectionId, this.props.match.params.unitId, this.context.authenticatedUser.username)
//     .then(({
//       blocks, courseBlockId, subSectionIds, subSectionMetadata, units, unitId,
//     }) => {
//       console.log(subSectionMetadata);
//       console.log(blocks[subSectionMetadata.itemId].lmsWebUrl);
//       // If the sub section is time limited, that means it is some sort of special exam.
//       const specialExam = subSectionMetadata.isTimeLimited;
//       if (specialExam) {
//         global.location.href = blocks[subSectionMetadata.itemId].lmsWebUrl;
//         return; // We get out of here to abort loading.
//       }

//       this.setState({
//         loading: false,
//         blocks,
//         units,
//         subSectionMetadata,
//         subSectionId: subSectionMetadata.itemId,
//         subSectionIds,
//         unitId,
//         // eslint-disable-next-line react/no-unused-state
//         courseBlockId, // TODO: Currently unused, but may be necessary.
//       });
//     });
// }

// componentDidUpdate(prevProps, prevState) {
//   if (
//     this.props.match.params.courseId !== prevProps.match.params.courseId ||
//     this.state.subSectionId !== prevState.subSectionId ||
//     this.state.unitId !== prevState.unitId
//   ) {
//     history.push(`/course/${this.props.match.params.courseId}/${this.state.subSectionId}/${this.state.unitId}`);
//   }
// }


// handlePreviousClick = () => {
//   const index = this.state.subSectionMetadata.unitIds.indexOf(this.state.unitId);
//   if (index > 0) {
//     this.setState({
//       unitId: this.state.subSectionMetadata.unitIds[index - 1],
//     });
//   } else {
//     const subSectionIndex = this.state.subSectionIds.indexOf(this.state.subSectionId);
//     if (subSectionIndex > 0) {
//       const previousSubSectionId = this.state.subSectionIds[subSectionIndex - 1];

//       loadSubSectionMetadata(this.props.match.params.courseId, previousSubSectionId, { last: true }).then(({ subSectionMetadata, units, unitId }) => {
//         const specialExam = subSectionMetadata.isTimeLimited;
//         if (specialExam) {
//           global.location.href = this.state.blocks[subSectionMetadata.itemId].lmsWebUrl;
//           return; // We get out of here to abort loading.
//         }
//         this.setState({
//           subSectionId: subSectionMetadata.itemId,
//           subSectionMetadata,
//           units,
//           unitId,
//         });
//       });
//     } else {
//       console.log('we are at the beginning!');
//       // TODO: We need to calculate whether we're on the first/last subSection in render so we can
//       // disable the Next/Previous buttons.  That'll involve extracting a bit of logic from this
//       // function and handleNextClick below and reusing it - memoized, probably - in render().
//     }
//   }
// }

// handleNextClick = () => {
//   const index = this.state.subSectionMetadata.unitIds.indexOf(this.state.unitId);
//   if (index < this.state.subSectionMetadata.unitIds.length - 1) {
//     this.setState({
//       unitId: this.state.subSectionMetadata.unitIds[index + 1],
//     });
//   } else {
//     const subSectionIndex = this.state.subSectionIds.indexOf(this.state.subSectionId);
//     if (subSectionIndex < this.state.subSectionIds.length - 1) {
//       const nextSubSectionId = this.state.subSectionIds[subSectionIndex + 1];

//       loadSubSectionMetadata(this.props.match.params.courseId, nextSubSectionId, { first: true })
//         .then(({ subSectionMetadata, units, unitId }) => {
//           const specialExam = subSectionMetadata.isTimeLimited;
//           if (specialExam) {
//             global.location.href = this.state.blocks[subSectionMetadata.itemId].lmsWebUrl;
//             return; // We get out of here to abort loading.
//           }
//           this.setState({
//             subSectionId: subSectionMetadata.itemId,
//             subSectionMetadata,
//             units,
//             unitId,
//           });
//         });
//     } else {
//       console.log('we are at the end!');
//     }
//   }
// }
