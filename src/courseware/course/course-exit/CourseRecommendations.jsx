import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  FormattedMessage, injectIntl, intlShape, defineMessages,
} from '@edx/frontend-platform/i18n';
import { useSelector, useDispatch } from 'react-redux';
import {
  Hyperlink, DataTable, CardView, Card,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import truncate from 'truncate-html';
import { useModel } from '../../../generic/model-store';
import fetchCourseRecommendations from './data/thunks';
import { FAILED, LOADED, LOADING } from './data/slice';
import CatalogSuggestion from './CatalogSuggestion';
import PageLoading from '../../../generic/PageLoading';
import { logClick } from './utils';

const messages = defineMessages({
  recommendationsHeading: {
    id: 'courseCelebration.recommendations.heading',
    description: 'Header for recommendations section of course celebration',
    defaultMessage: 'Keep building your skills with these courses!',
  },
  recommendationsCourseFooter: {
    id: 'courseCelebration.recommendations.label', // not very descriptive, but is historical
    description: 'Label on a discovery-card that lets a user know that it is a course card',
    defaultMessage: 'Course',
  },
  listJoin: {
    id: 'courseCelebration.recommendations.formatting.list_join',
    description: 'Joining mark or word for a list of items, use the {sp} placeholder to include space before the joining word',
    // eslint-disable-next-line prefer-template
    defaultMessage: ('{style, select, '
      + 'punctuation {, } ' // HACK: select keys must match ListStyles, above, but must be statically coded for extract
      + 'conjunction { {sp}and } ' // HACK: interpolating a space character to get a leading-space here
      + 'other { }}'),
  },
  browseCatalog: {
    id: 'courseCelebration.recommendations.browse_catalog',
    description: 'Link to course catalog in course celebration',
    defaultMessage: 'Explore more courses',
  },
  loadingRecommendations: {
    id: 'courseCelebration.recommendations.loading_recommendations',
    description: 'Screen-reader text for the loading screen for recommendations',
    defaultMessage: 'Loading recommendations',
  },
});

const ListStyles = {
  punctuation: 'punctuation',
  conjunction: 'conjunction',
};

function CourseCard({
  original: {
    title,
    image,
    owners,
    marketingUrl,
    onClick,
  },
  intl,
}) {
  const formatList = (items, style) => (
    items.join(intl.formatMessage(
      messages.listJoin,
      { style, sp: ' ' }, // HACK: there isn't a way to escape a leading space in the format, so pass one in
    ))
  );

  const formattedOwners = formatList(
    owners.map(owner => owner.key),
    ListStyles.punctuation,
    intl,
  );

  const subtitle = (
    <FormattedMessage
      id="courseCelebration.recommendations.card.schools.label"
      description="Screenreader label for the Schools and Partners running the course."
      defaultMessage="Schools and Partners"
    >{text => (
      <>
        <span className="sr-only">{text}: </span>
        {truncate(formattedOwners, 40, { reserveLastWord: -1 })}
      </>
    )}
    </FormattedMessage>
  );

  return (
    <div
      role="group"
      aria-label={title}
    >
      <Hyperlink
        destination={marketingUrl}
        className="text-decoration-none"
        onClick={onClick}
      >
        <Card isClickable style={{ width: '21rem', height: '100%' }}>
          <Card.ImageCap src={image.src} />
          <Card.Header title={truncate(title, 70, { reserveLastWord: -1 })} subtitle={subtitle} size="sm" />
          {/* Section is needed for internal vertical spacing to work out. If you can remove, be my guest */}
          <Card.Section> <></> </Card.Section>
          <Card.Footer textElement={intl.formatMessage(messages.recommendationsCourseFooter)}><></></Card.Footer>
        </Card>
      </Hyperlink>
    </div>
  );
}

CourseCard.propTypes = {
  original: PropTypes.shape({
    marketingUrl: PropTypes.string,
    title: PropTypes.string,
    image: PropTypes.shape({
      src: PropTypes.string,
    }),
    owners: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
    })),
    onClick: PropTypes.func,
  }).isRequired,
  intl: intlShape.isRequired,
};

const IntlCard = injectIntl(CourseCard);

function CourseRecommendations({ intl, variant }) {
  const { courseId, recommendationsStatus } = useSelector(state => ({ ...state.recommendations, ...state.courseware }));
  const { recommendations } = useModel('coursewareMeta', courseId);
  const { org, number } = useModel('courseHomeMeta', courseId);
  const dispatch = useDispatch();

  const courseKey = `${org}+${number}`;
  const { administrator } = getAuthenticatedUser();

  useEffect(() => {
    dispatch(fetchCourseRecommendations(courseKey, courseId));
  }, [dispatch]);

  const recommendationsLength = recommendations ? recommendations.length : 0;

  if (recommendationsStatus && recommendationsStatus !== LOADING) {
    sendTrackEvent('edx.ui.lms.course_exit.recommendations.viewed', {
      course_key: courseKey,
      recommendations_status: recommendationsStatus,
      recommendations_length: recommendationsLength,
    });
  }

  if (recommendationsStatus === FAILED || (recommendationsStatus === LOADED && recommendationsLength < 2)) {
    return (<CatalogSuggestion variant={variant} />);
  }

  if (recommendationsStatus === LOADING) {
    return <PageLoading srMessage={intl.formatMessage(messages.loadingRecommendations)} />;
  }

  const onCardClick = (url) => (e) => {
    e.preventDefault();
    logClick(org, courseId, administrator, 'recommendation_discovery_card');
    setTimeout(() => {
      window.location.href = url;
    }, (200));
  };

  const recommendationData = recommendations.map((recommendation) => (
    { ...recommendation, onClick: onCardClick(recommendation.marketingUrl) }
  ));

  return (
    <div className="course-recommendations d-flex flex-column align-items-center" data-testid="course-recommendations">
      <h2 className="text-center mb-3">{intl.formatMessage(messages.recommendationsHeading)}</h2>
      <div className="mb-2 mt-3">
        <DataTable
          isPaginated
          itemCount={recommendationsLength}
          data={recommendationData}
          columns={[{ Header: 'Title', accessor: 'title' }]}
          initialState={{
            pageSize: 3,
            pageIndex: 0,
          }}
        >
          <CardView CardComponent={IntlCard} />
        </DataTable>
      </div>
      <Hyperlink
        style={{ textDecoration: 'underline' }}
        destination={getConfig().SEARCH_CATALOG_URL}
        className="text-center"
      >
        {intl.formatMessage(messages.browseCatalog)}
      </Hyperlink>
    </div>
  );
}

CourseRecommendations.propTypes = {
  intl: intlShape.isRequired,
  variant: PropTypes.string.isRequired,
};

export default injectIntl(CourseRecommendations);
