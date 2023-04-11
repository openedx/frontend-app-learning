import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Container,
  Hyperlink,
  Layout,
} from '@edx/paragon';
import { useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform';
import messages from '../messages';
import { useModel, updateModel } from '../../../generic/model-store';
import { searchCourseContent } from '../../data/thunks';

const CoursewareSearch = ({ courseId, intl }) => {
  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const dispatch = useDispatch();

  const {
    results,
    took,
  } = useModel('contentSearchResults', courseId);

  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!searchKeyword) {
      dispatch(updateModel({
        modelType: 'contentSearchResults',
        model: {
          id: courseId,
          results: [],
          took: false,
        },
      }));
    }
  }, [searchKeyword]);

  const searchClick = () => {
    sendTrackingLogEvent('edx.course.home.courseware_search.clicked', {
      ...eventProperties,
      event_type: 'search',
      keyword: searchKeyword,
    });
    dispatch(searchCourseContent(courseId, searchKeyword));
  };

  return (
    <div>
      <Form.Group>
        <Form.Control
          className="float-left w-75"
          floatingLabel={intl.formatMessage(messages.coursewareSearchInputLabel)}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Button
          variant="primary"
          className="float-left"
          onClick={() => searchClick()}
        >
          {intl.formatMessage(messages.coursewareSearchButtonLabel)}
        </Button>
        <div className="clearfix" />
      </Form.Group>
      {(took && results.length === 0) && (
        <Container size="xl">
          {
            `Could not find any component matching "${searchKeyword}"`
          }
        </Container>
      )}
      {(took && results.length > 0) && results.map(resultItem => (
        <Container
          size="xl"
        >
          <Layout>
            <Layout.Element>
              <Hyperlink
                destination={`${getConfig().LMS_BASE_URL}${resultItem.data.url}`}
              >
                { resultItem.data.location.join('/') }
              </Hyperlink>
            </Layout.Element>
          </Layout>
        </Container>
      ))}
    </div>
  );
};

CoursewareSearch.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearch);
