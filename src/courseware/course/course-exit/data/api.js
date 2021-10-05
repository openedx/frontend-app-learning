import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

function filterRecommendationsList(
  {
    data: {
      uuid,
      recommendations,
    },
  },
  {
    data: enrollments,
  },
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

export async function getCourseRecommendations(courseKey) {
  const discoveryApiUrl = getConfig().DISCOVERY_API_BASE_URL;
  if (!discoveryApiUrl) {
    return [];
  }
  const recommendationsUrl = new URL(`${discoveryApiUrl}/api/v1/course_recommendations/${courseKey}?exclude_utm=true`);
  const enrollmentsUrl = new URL(`${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`);
  const [recommendationsResponse, enrollmentsResponse] = await Promise.all([
    getAuthenticatedHttpClient().get(recommendationsUrl),
    getAuthenticatedHttpClient().get(enrollmentsUrl),
  ]);
  return filterRecommendationsList(camelCaseObject(recommendationsResponse), camelCaseObject(enrollmentsResponse));
}

export async function postUnsubscribeFromGoalReminders(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_id: courseId,
    subscribed_to_reminders: false,
  });
}
