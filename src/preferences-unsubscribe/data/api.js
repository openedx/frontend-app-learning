import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

export const getUnsubscribeUrl = (userToken) => (
  `${getSiteConfig().lmsBaseUrl}/api/notifications/preferences/update/${userToken}/`
);

export async function unsubscribeNotificationPreferences(userToken) {
  const url = getUnsubscribeUrl(userToken);
  return getAuthenticatedHttpClient().get(url);
}
