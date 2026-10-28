import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

function filterRecommendationsList(
  {
    data: {
      uuid,
      recommendations,
    },
  },
  enrollments,
) {
  const enrollmentRunIds = enrollments.map(({
    courseDetails: {
      courseId,
    },
  }) => courseId);

  return recommendations.filter(({ uuid: recUuid, courseRunKeys }) => (
    recUuid !== uuid && courseRunKeys.every((key) => !enrollmentRunIds.includes(key))
  ));
}

// Returns every enrollment of the current user. The v2 list is paginated, so
// each page is read in turn until there is no next page.
//
// Unlike the v1 list, v2 also returns inactive enrollments. A course the
// learner has unenrolled from therefore counts as enrolled here and is not
// recommended again.
async function getAllEnrollments(url) {
  const { data } = await getAuthenticatedHttpClient().get(url);
  if (!data.next) {
    return data.results;
  }
  return [...data.results, ...await getAllEnrollments(data.next)];
}

export async function getCourseRecommendations(courseKey) {
  const discoveryApiUrl = getConfig().DISCOVERY_API_BASE_URL;
  if (!discoveryApiUrl) {
    return [];
  }
  const recommendationsUrl = new URL(`${discoveryApiUrl}/api/v1/course_recommendations/${courseKey}?exclude_utm=true`);
  const enrollmentsUrl = new URL(`${getConfig().LMS_BASE_URL}/api/enrollment/v2/enrollment/?page_size=100`);
  const [recommendationsResponse, enrollments] = await Promise.all([
    getAuthenticatedHttpClient().get(recommendationsUrl),
    getAllEnrollments(enrollmentsUrl),
  ]);
  return filterRecommendationsList(camelCaseObject(recommendationsResponse), camelCaseObject(enrollments));
}

export async function postUnsubscribeFromGoalReminders(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_id: courseId,
    subscribed_to_reminders: false,
  });
}
