import { camelCaseObject, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

import { getResponseStatus } from '@src/data/http-error';

const getTourDataUrl = (username) => `${getSiteConfig().lmsBaseUrl}/api/user_tours/v1/${username}`;

export async function getTourData(username) {
  try {
    const { data } = await getAuthenticatedHttpClient().get(getTourDataUrl(username));
    return { toursEnabled: true, ...camelCaseObject(data) };
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
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
  return getAuthenticatedHttpClient().patch(getTourDataUrl(username), tourData);
}
