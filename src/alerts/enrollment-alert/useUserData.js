import {
  useContext, useEffect, useState, useCallback,
} from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export default function useUserData() {
  const { authenticatedUser } = useContext(AppContext);
  const [userData, setUserData] = useState(null);

  const getUserData = useCallback(async () => {
    const { data } = await getAuthenticatedHttpClient().get(
      `${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${
        authenticatedUser.username
      }`,
    );
    return data;
  }, [authenticatedUser.username]);

  useEffect(() => {
    async function fetchData() {
      const data = await getUserData();
      setUserData(data);
    }
    fetchData();
  }, [getUserData]);

  return { userData };
}
