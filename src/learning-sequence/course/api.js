import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/* eslint-disable import/prefer-default-export */

const getSequenceXModuleHandlerUrl = (courseUsageKey, sequenceId) =>
  `${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/xblock/${sequenceId}/handler/xmodule_handler`;

export async function getSequenceMetadata(courseUsageKey, sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/metadata`, {});

  return data;
}

export async function saveSequencePosition(courseUsageKey, sequenceId, position) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('position', position);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/goto_position`,
    urlEncoded.toString(),
    requestConfig,
  );

  return data;
}
