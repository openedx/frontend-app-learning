import { SpecialExamsProvider as LibrarySpecialExamsProvider, type LogError } from '@edx/frontend-lib-special-exams';
import {
  getAuthenticatedHttpClient, logError, useAppConfig, useAuthenticatedUser, useSiteConfig,
} from '@openedx/frontend-base';
import type { ReactNode } from 'react';

// The library hands over whatever it caught; frontend-base's logger takes a message or an error.
const logSpecialExamsError: LogError = (message, customAttributes) => (
  logError(message as string | Error, customAttributes)
);

// Learning's host side of the special exams library: config, the HTTP client, the logger and the signed-in flag.
const SpecialExamsProvider = ({ children }: { children: ReactNode }) => {
  const { lmsBaseUrl, siteName } = useSiteConfig();
  const appConfig = useAppConfig();
  const authenticatedUser = useAuthenticatedUser();
  return (
    <LibrarySpecialExamsProvider
      config={{
        examsBaseUrl: appConfig.EXAMS_BASE_URL as string | null | undefined,
        lmsBaseUrl,
        siteName,
        supportUrl: appConfig.SUPPORT_URL as string | undefined,
        contactUrl: appConfig.CONTACT_URL as string | undefined,
        proctoredExamFaqUrl: appConfig.PROCTORED_EXAM_FAQ_URL as string | undefined,
        proctoredExamRulesUrl: appConfig.PROCTORED_EXAM_RULES_URL as string | undefined,
      }}
      httpClient={getAuthenticatedHttpClient()}
      logError={logSpecialExamsError}
      isAuthenticated={!!authenticatedUser}
    >
      {children}
    </LibrarySpecialExamsProvider>
  );
};

export default SpecialExamsProvider;
