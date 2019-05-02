import { fetchUserAccount as _fetchUserAccount, UserAccountApiService } from '@edx/frontend-auth';

let userAccountApiService = null;

export function configureUserAccountApiService(configuration, apiClient) {
  userAccountApiService = new UserAccountApiService(apiClient, configuration.LMS_BASE_URL);
}

export function fetchUserAccount(username) {
  return _fetchUserAccount(userAccountApiService, username);
}
