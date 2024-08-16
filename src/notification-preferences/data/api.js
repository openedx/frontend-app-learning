import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getUnsubscribeUrl = (userToken, updatePatch) => (
  `${getConfig().LMS_BASE_URL}/api/notifications/preferences/update/${userToken}/${updatePatch}/`
);

export async function updateNotificationPreferencesFromPatch(userToken, updatePatch) {
  const url = getUnsubscribeUrl(userToken, updatePatch);
  await getAuthenticatedHttpClient().get(url);
}
