import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { Breadcrumb } from '@edx/paragon';

import PageLoading from './PageLoading';
import messages from './messages';
import SubSectionNavigation from './SubSectionNavigation';

async function getCourseBlocks(courseId, username) {
  const queryParams = Object.entries({
    course_id: courseId,
    username,
    depth: 3,
    requested_fields: 'children',
  }).reduce((acc, [key, value]) => (acc === '' ? `?${key}=${value}` : `${acc}&${key}=${value}`), '');

  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/${queryParams}`, {});

  return { models: organizeCourseModels(data.blocks), courseBlockId: data.root };
}

function organizeCourseModels(blocksMap) {
  const models = {};

  const blocks = Object.values(blocksMap);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    models[block.id] = camelCaseObject(block);
  }

  // NOTE: If a child is listed as a child of multiple models, the last one in wins.  This does NOT
  // support multiple parents.
  const modelValues = Object.values(models);
  for (let i = 0; i < modelValues.length; i++) {
    const model = modelValues[i];

    if (Array.isArray(model.children)) {
      for (let j = 0; j < model.children.length; j++) {
        const child = models[model.children[j]];
        child.parentId = model.id;
      }
    }
  }

  return models;
}

function findFirstLeafChild(models, blockId) {
  const block = models[blockId];
  if (Array.isArray(block.children) && block.children.length > 0) {
    return findFirstLeafChild(models, block.children[0]);
  }
  return block;
}

function findBlockAncestry(models, block, descendents = []) {
  descendents.unshift(block);
  if (block.parentId === undefined) {
    return descendents;
  }
  return findBlockAncestry(models, models[block.parentId], descendents);
}

class LearningSequencePage extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      models: {},
      courseBlockId: null,
      loading: true,
      currentUnitId: null,
    };

    this.iframeRef = React.createRef();
  }

  componentDidMount() {
    getCourseBlocks(this.props.match.params.courseId, this.context.authenticatedUser.username)
      .then(({ models, courseBlockId }) => {
        const currentUnit = findFirstLeafChild(models, courseBlockId); // Temporary until we know where the user is in the course.
        this.setState({
          models,
          courseBlockId,
          loading: false,
          currentUnitId: currentUnit.id,
        });
      });
  }

  handleUnitChange = (unitId) => {
    this.setState({
      currentUnitId: unitId,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <PageLoading srMessage={this.props.intl.formatMessage(messages['learn.loading.learning.sequence'])} />
      );
    }

    const currentUnit = this.state.models[this.state.currentUnitId];

    // TODO: All of this should be put in state or memoized.
    const course = this.state.models[this.state.courseBlockId];
    const chapter = this.state.models[course.children[0].id];
    const subSection = this.state.models[currentUnit.parentId];
    const ancestry = findBlockAncestry(this.state.models, currentUnit);
    const breadcrumbLinks = ancestry.slice(0, ancestry.length - 1).map(ancestor => ({ label: ancestor.displayName, url: global.location.href }));


    console.log(course, chapter, currentUnit, ancestry);

    return (
      <main >
        <div className="container-fluid">
          <h1>{course.displayName}</h1>
          <Breadcrumb
            links={breadcrumbLinks}
            activeLabel={currentUnit.displayName}
            spacer={<span>&gt;</span>}
          />
          <SubSectionNavigation models={this.state.models} subSection={subSection} unitClickHandler={this.handleUnitChange} />
        </div>
        <iframe
          title="yus"
          ref={this.iframeRef}
          src={currentUnit.studentViewUrl}
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
