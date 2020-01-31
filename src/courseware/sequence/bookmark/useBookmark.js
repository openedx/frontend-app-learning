import { useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

export default function useBookmark(usageId, isBookmarked, onBookmarkChanged) {
  const [requestIsInFlight, setRequestInFlight] = useState(false);
  const httpClient = getAuthenticatedHttpClient();
  const user = getAuthenticatedUser();

  const toggle = () => {
    if (requestIsInFlight || !user || !user.username) {
      return;
    }

    const add = async () => httpClient.post(`${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`, { usage_id: usageId });
    const remove = async () => httpClient.delete(`${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/${user.username},${usageId}/`);

    setRequestInFlight(true);

    if (!isBookmarked) {
      add().then(() => {
        onBookmarkChanged(usageId, true);
      }).finally(() => {
        setRequestInFlight(false);
      });
    } else {
      remove().then(() => {
        onBookmarkChanged(usageId, false);
      }).finally(() => {
        setRequestInFlight(false);
      });
    }
  };

  return [toggle, requestIsInFlight];
}
