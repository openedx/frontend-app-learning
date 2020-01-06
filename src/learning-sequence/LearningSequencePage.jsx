/* eslint-disable no-plusplus */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig, history } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { Breadcrumb } from '@edx/paragon';

import PageLoading from './PageLoading';
import messages from './messages';
import SubSectionNavigation from './SubSectionNavigation';
import { loadCourseSequence, findBlockAncestry, loadSubSectionMetadata } from './api';

class LearningSequencePage extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: true,
      blocks: {},
      units: {},
      subSectionMetadata: null,
      subSectionId: null,
      subSectionIds: [],
      unitId: null,
      courseBlockId: null,
    };

    this.iframeRef = React.createRef();
  }

  componentDidMount() {
    loadCourseSequence(this.props.match.params.courseId, null, this.context.authenticatedUser.username)
      .then(({
        blocks, courseBlockId, subSectionIds, subSectionMetadata, units, unitId,
      }) => {
        this.setState({
          loading: false,
          blocks,
          units,
          subSectionMetadata,
          subSectionId: subSectionMetadata.itemId,
          subSectionIds,
          unitId,
          courseBlockId, // TODO: Currently unused, but may be necessary.
        });
      });
  }

  handlePreviousClick = () => {
    const index = this.state.subSectionMetadata.unitIds.indexOf(this.state.unitId);
    if (index > 0) {
      this.setState({
        unitId: this.state.subSectionMetadata.unitIds[index - 1],
      });
    } else {
      const subSectionIndex = this.state.subSectionIds.indexOf(this.state.subSectionId);
      if (subSectionIndex > 0) {
        const previousSubSectionId = this.state.subSectionIds[subSectionIndex - 1];

        loadSubSectionMetadata(this.props.match.params.courseId, previousSubSectionId).then(({ subSectionMetadata, units, unitId }) => {
          this.setState({
            subSectionId: subSectionMetadata.itemId,
            subSectionMetadata,
            units,
            unitId,
          });
        });
      } else {
        console.log('we are at the beginning!');
        // TODO: We need to calculate whether we're on the first/last subSection in render so we can
        // disable the Next/Previous buttons.  That'll involve extracting a bit of logic from this
        // function and handleNextClick below and reusing it - memoized, probably - in render().
      }
    }
  }

  handleNextClick = () => {
    const index = this.state.subSectionMetadata.unitIds.indexOf(this.state.unitId);
    if (index < this.state.subSectionMetadata.unitIds.length - 1) {
      this.setState({
        unitId: this.state.subSectionMetadata.unitIds[index + 1],
      });
    } else {
      const subSectionIndex = this.state.subSectionIds.indexOf(this.state.subSectionId);
      if (subSectionIndex < this.state.subSectionIds.length - 1) {
        const nextSubSectionId = this.state.subSectionIds[subSectionIndex + 1];

        loadSubSectionMetadata(this.props.match.params.courseId, nextSubSectionId).then(({ subSectionMetadata, units, unitId }) => {
          this.setState({
            subSectionId: subSectionMetadata.itemId,
            subSectionMetadata,
            units,
            unitId,
          });
        });
      } else {
        console.log('we are at the end!');
      }
    }
  }

  handleUnitChange = (unitId) => {
    this.setState({
      unitId,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <PageLoading srMessage={this.props.intl.formatMessage(messages['learn.loading.learning.sequence'])} />
      );
    }

    const [course, chapter, subSection] = findBlockAncestry(
      this.state.blocks,
      this.state.blocks[this.state.subSectionId],
    );

    const currentUnit = this.state.units[this.state.unitId];
    const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${this.state.unitId}`;

    return (
      <main >
        <div className="container-fluid">
          <h1>{course.displayName}</h1>
          <Breadcrumb
            links={[
              { label: course.displayName, url: global.location.href },
              { label: chapter.displayName, url: global.location.href },
              { label: subSection.displayName, url: global.location.href },
            ]}
            activeLabel={currentUnit.pageTitle}
            spacer={<span>&gt;</span>}
          />
          <SubSectionNavigation
            units={this.state.units}
            unitIds={this.state.subSectionMetadata.unitIds}
            activeUnitId={this.state.unitId}
            unitClickHandler={this.handleUnitChange}
            nextClickHandler={this.handleNextClick}
            previousClickHandler={this.handlePreviousClick}
          />
        </div>
        <iframe
          title="yus"
          ref={this.iframeRef}
          src={iframeUrl}
        />
      </main>
    );
  }
}

LearningSequencePage.contextType = AppContext;

export default injectIntl(LearningSequencePage);

LearningSequencePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      blockIndex: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};
