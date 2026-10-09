import React, { useContext } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { SpecialExamsProvider as LibrarySpecialExamsProvider } from '@edx/frontend-lib-special-exams';

export const getSpecialExamsConfig = () => {
  const config = getConfig();
  return {
    examsBaseUrl: config.EXAMS_BASE_URL,
    lmsBaseUrl: config.LMS_BASE_URL,
    siteName: config.SITE_NAME,
    supportUrl: config.SUPPORT_URL,
    contactUrl: config.CONTACT_URL,
    proctoredExamFaqUrl: config.PROCTORED_EXAM_FAQ_URL,
    proctoredExamRulesUrl: config.PROCTORED_EXAM_RULES_URL,
  };
};

const SpecialExamsProvider = ({ children }: { children: React.ReactNode }) => {
  const { authenticatedUser } = useContext(AppContext);
  return (
    <LibrarySpecialExamsProvider
      config={getSpecialExamsConfig()}
      httpClient={getAuthenticatedHttpClient()}
      logError={logError}
      isAuthenticated={!!authenticatedUser}
    >
      {children}
    </LibrarySpecialExamsProvider>
  );
};

export default SpecialExamsProvider;
