import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export async function getTourData(username) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_tours/v1/${username}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return { toursEnabled: true, ...camelCaseObject(data) };
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    /** The API will return a
     *    401 if the user is not authenticated
     *    403 if the tour waffle flag is inactive
     *    404 if no User Tour objects exist for the given username
     */
    if (httpErrorStatus === 401 || httpErrorStatus === 403 || httpErrorStatus === 404) {
      return { toursEnabled: false };
    }
    throw error;
  }
}

export async function patchTourData(username, tourData) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_tours/v1/${username}`;
  return getAuthenticatedHttpClient().patch(url, tourData);
}
