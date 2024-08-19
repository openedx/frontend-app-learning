import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getUnsubscribeUrl = (userToken, updatePatch) => (
  `${getConfig().LMS_BASE_URL}/api/notifications/preferences/update/${userToken}/${updatePatch}/`
);

export async function unsubscribeNotificationPreferences(userToken, updatePatch) {
  const url = getUnsubscribeUrl(userToken, updatePatch);
  return getAuthenticatedHttpClient().get(url);
}
