import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getUnsubscribeUrl = (userToken) => (
  `${getConfig().LMS_BASE_URL}/api/notifications/preferences/update/${userToken}/`
);

export async function unsubscribeNotificationPreferences(userToken) {
  const url = getUnsubscribeUrl(userToken);
  return getAuthenticatedHttpClient().get(url);
}
